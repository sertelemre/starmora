package app

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/cookiejar"
	"net/http/httptest"
	"net/url"
	"os"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// A protocol fixture, never enabled by the application or selected by users.
type fixtureProvider struct{}

func (fixtureProvider) Name() string { return "test-fixture" }

func (fixtureProvider) Ready() bool { return true }
func (fixtureProvider) Locations(context.Context, string) ([]Location, error) {
	return []Location{{"Istanbul, Turkey", "Europe/Istanbul"}}, nil
}

func TestStablePaginationAndOwnership(t *testing.T) {
	db := testDB(t)
	s := New(db, fixtureProvider{}, false)
	h := httptest.NewServer(s.Handler())
	defer h.Close()
	jar, _ := cookiejar.New(nil)
	client := &http.Client{Jar: jar}
	base, _ := url.Parse(h.URL)
	response, err := client.Get(h.URL + "/api/session")
	if err != nil {
		t.Fatal(err)
	}
	response.Body.Close()
	var owner string
	if err = db.QueryRow(context.Background(), "SELECT id::text FROM sessions WHERE token_hash=$1", hash(jar.Cookies(base)[0].Value)).Scan(&owner); err != nil {
		t.Fatal(err)
	}
	_, err = db.Exec(context.Background(), `INSERT INTO charts(id,owner_id,name,birth,result,provider,created_at) SELECT md5('chart'||g::text)::uuid,$1,'Pagination chart','{}'::jsonb,'{}'::jsonb,'test-fixture',now()-g*interval '1 minute' FROM generate_series(1,101) g`, owner)
	if err != nil {
		t.Fatal(err)
	}
	getPage := func(path string) []Chart {
		t.Helper()
		resp, e := client.Get(h.URL + path)
		if e != nil {
			t.Fatal(e)
		}
		defer resp.Body.Close()
		if resp.StatusCode != 200 {
			t.Fatalf("page status %d", resp.StatusCode)
		}
		var c []Chart
		if e = json.NewDecoder(resp.Body).Decode(&c); e != nil {
			t.Fatal(e)
		}
		return c
	}
	first := getPage("/api/charts")
	if len(first) != 100 {
		t.Fatalf("page one has %d items", len(first))
	}
	last := first[99]
	// Deleting the boundary row cannot invalidate a keyset cursor.
	if _, err = db.Exec(context.Background(), "DELETE FROM charts WHERE id=$1", last.ID); err != nil {
		t.Fatal(err)
	}
	query := url.Values{"before": {last.CreatedAt.Format(time.RFC3339Nano)}, "beforeId": {last.ID}}
	second := getPage("/api/charts?" + query.Encode())
	if len(second) != 1 {
		t.Fatalf("page two has %d items", len(second))
	}
	for _, a := range first {
		if a.ID == second[0].ID {
			t.Fatal("pagination duplicated a chart")
		}
	}
	outsider := &http.Client{}
	response, err = outsider.Get(h.URL + "/api/charts?" + query.Encode())
	if err != nil {
		t.Fatal(err)
	}
	defer response.Body.Close()
	data, _ := io.ReadAll(response.Body)
	if string(data) != "[]\n" {
		t.Fatal("cursor exposed another owner's charts")
	}
	req, _ := http.NewRequest("POST", h.URL+"/api/charts", strings.NewReader(`{"name":"x'); DROP TABLE users; --","birth":{"date":"1990-01-01","time":"12:00","place":"Istanbul","timezone":"Europe/Istanbul"}}`))
	req.Header.Set("Content-Type", "application/json")
	response, err = client.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	response.Body.Close()
	if response.StatusCode != 201 {
		t.Fatalf("quoted name failed: %d", response.StatusCode)
	}
	var exists bool
	err = db.QueryRow(context.Background(), "SELECT EXISTS(SELECT 1 FROM users)").Scan(&exists)
	if err != nil {
		t.Fatal("parameterized input damaged schema", err)
	}
}

func TestConcurrentSessionClaimsAreAtomic(t *testing.T) {
	db := testDB(t)
	s := New(db, fixtureProvider{}, false)
	ss, err := s.newSession(context.Background(), httptest.NewRecorder())
	if err != nil {
		t.Fatal(err)
	}
	var wg sync.WaitGroup
	results := make(chan error, 2)
	start := make(chan struct{})
	for i := 0; i < 2; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			ctx := context.Background()
			tx, e := db.Begin(ctx)
			if e != nil {
				results <- e
				return
			}
			defer tx.Rollback(ctx)
			u := User{uuid(), "Claim test", fmt.Sprintf("claim%d@example.test", i)}
			if _, e = tx.Exec(ctx, "INSERT INTO users(id,name,email,password_hash) VALUES($1,$2,$3,'test-only')", u.ID, u.Name, u.Email); e != nil {
				results <- e
				return
			}
			<-start
			results <- s.authenticate(ctx, httptest.NewRecorder(), ss, u, tx)
		}(i)
	}
	close(start)
	wg.Wait()
	close(results)
	successes := 0
	for e := range results {
		if e == nil {
			successes++
		}
	}
	if successes != 1 {
		t.Fatalf("same session was claimed %d times", successes)
	}
	var users int
	if err = db.QueryRow(context.Background(), "SELECT count(*) FROM users").Scan(&users); err != nil || users != 1 {
		t.Fatalf("failed registration left an account: count=%d error=%v", users, err)
	}
}
func (fixtureProvider) Calculate(context.Context, Birth) (Result, error) {
	return Result{Type: "Generator", Profile: "1 / 3", Authority: "Sacral", Strategy: "To Respond", Centers: []string{"sacral", "root"}, Gates: []int{3, 60}, Channels: []string{"3-60"}, Personality: map[string]Activation{"Sun": {Gate: 3, Line: 1}}, Design: map[string]Activation{"Sun": {Gate: 60, Line: 3}}}, nil
}
func testDB(t *testing.T) *pgxpool.Pool {
	t.Helper()
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("set TEST_DATABASE_URL to run PostgreSQL integration tests")
	}
	ctx := context.Background()
	admin, err := pgxpool.New(ctx, dsn)
	if err != nil {
		t.Fatal(err)
	}
	schema := "test_" + strings.ReplaceAll(uuid(), "-", "")
	if _, err = admin.Exec(ctx, "CREATE SCHEMA "+schema); err != nil {
		t.Fatal(err)
	}
	config, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		t.Fatal(err)
	}
	config.ConnConfig.RuntimeParams["search_path"] = schema
	db, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close(); _, _ = admin.Exec(ctx, "DROP SCHEMA "+schema+" CASCADE"); admin.Close() })
	if err = Migrate(ctx, db); err != nil {
		t.Fatal(err)
	}
	return db
}
func TestGuestAndAccountLifecycle(t *testing.T) {
	db := testDB(t)
	srv := httptest.NewServer(New(db, NewLocal(), false).Handler())
	defer srv.Close()
	newClient := func() *http.Client { jar, _ := cookiejar.New(nil); return &http.Client{Jar: jar} }
	guest, other := newClient(), newClient()
	request := func(c *http.Client, method, path, body string, want int) []byte {
		t.Helper()
		req, _ := http.NewRequest(method, srv.URL+path, strings.NewReader(body))
		if body != "" {
			req.Header.Set("Content-Type", "application/json")
		}
		resp, err := c.Do(req)
		if err != nil {
			t.Fatal(err)
		}
		defer resp.Body.Close()
		data, _ := io.ReadAll(resp.Body)
		if resp.StatusCode != want {
			t.Fatalf("%s %s: status=%d want=%d body=%s", method, path, resp.StatusCode, want, data)
		}
		return data
	}
	request(guest, "GET", "/api/session", "", 200)
	input := `{"name":"Test haritası","birth":{"date":"1990-01-01","time":"12:00","place":"Istanbul, Turkey","timezone":"Europe/Istanbul"}}`
	var chart Chart
	_ = json.Unmarshal(request(guest, "POST", "/api/charts", input, 201), &chart)
	request(other, "GET", "/api/charts/"+chart.ID, "", 404)
	request(other, "GET", "/api/charts/"+chart.ID+"/export", "", 404)
	request(other, "GET", "/api/charts/"+chart.ID+"/reading", "", 404)
	var reading Reading
	if err := json.Unmarshal(request(guest, "GET", "/api/charts/"+chart.ID+"/reading", "", 200), &reading); err != nil || len(reading.Centers) != 9 || len(reading.Gates) != len(chart.Result.Gates) {
		t.Fatal("existing stored chart did not receive detailed reading", err)
	}
	exportResponse, exportErr := guest.Get(srv.URL + "/api/charts/" + chart.ID + "/export")
	if exportErr != nil {
		t.Fatal(exportErr)
	}
	if exportResponse.StatusCode != 200 || exportResponse.Header.Get("Content-Disposition") != fmt.Sprintf("attachment; filename=\"starmora-%s.json\"", chart.ID) {
		t.Fatal("export headers or ownership invalid")
	}
	var exported struct {
		Chart
		Reading Reading `json:"reading"`
	}
	if err := json.NewDecoder(exportResponse.Body).Decode(&exported); err != nil || exported.Reading.Version != reading.Version || len(exported.Reading.Gates) != len(reading.Gates) || exported.ID != chart.ID {
		t.Fatal("export lost reading or chart identity", err)
	}
	exportResponse.Body.Close()
	if string(request(other, "GET", "/api/charts", "", 200)) != "[]\n" {
		t.Fatal("guest charts leaked")
	}
	// Register rotates the cookie and atomically claims existing guest charts.
	register := `{"name":"Test User","email":"TEST@example.com","password":"test-password-123"}`
	request(guest, "POST", "/api/auth/register", register, 201)
	request(guest, "GET", "/api/charts/"+chart.ID, "", 200)
	request(guest, "GET", "/api/charts/"+chart.ID+"/reading", "", 200)
	var password string
	_ = db.QueryRow(context.Background(), "SELECT password_hash FROM users WHERE email='test@example.com'").Scan(&password)
	if !strings.HasPrefix(password, "$2a$") {
		t.Fatal("password is not bcrypt hashed")
	}
	request(guest, "POST", "/api/auth/logout", "", 200)
	request(guest, "GET", "/api/charts/"+chart.ID, "", 404)
	request(guest, "GET", "/api/charts/"+chart.ID+"/reading", "", 404)
	request(guest, "POST", "/api/auth/login", `{"email":"test@example.com","password":"incorrect"}`, 401)
	// A new guest chart is also claimed on login to an existing account.
	var second Chart
	_ = json.Unmarshal(request(guest, "POST", "/api/charts", input, 201), &second)
	request(guest, "POST", "/api/auth/login", `{"email":"test@example.com","password":"test-password-123"}`, 200)
	var saved []Chart
	_ = json.Unmarshal(request(guest, "GET", "/api/charts", "", 200), &saved)
	if len(saved) != 2 {
		t.Fatalf("expected two migrated charts, got %d", len(saved))
	}
	request(other, "DELETE", "/api/charts/"+chart.ID, "", 404)
	request(guest, "DELETE", "/api/charts/"+chart.ID, "", 204)
	request(guest, "GET", "/api/charts/"+chart.ID, "", 404)
	request(guest, "GET", "/api/charts/"+chart.ID+"/reading", "", 404)
	request(other, "GET", "/api/charts/not-a-uuid", "", 404)
	request(other, "POST", "/api/auth/register", register, 409)
	req, _ := http.NewRequest("POST", srv.URL+"/api/auth/logout", nil)
	req.Header.Set("Origin", "https://evil.example")
	resp, err := guest.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()
	if resp.StatusCode != 403 {
		t.Fatal("cross-origin mutation accepted")
	}
	// Missing credentials never save a fake chart.
	unavailable := httptest.NewServer(New(db, &Bodygraph{}, false).Handler())
	defer unavailable.Close()
	req, _ = http.NewRequest("POST", unavailable.URL+"/api/charts", strings.NewReader(input))
	req.Header.Set("Content-Type", "application/json")
	resp, err = other.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()
	if resp.StatusCode != 503 {
		t.Fatal("unconfigured provider must be unavailable")
	}
	var expiring Chart
	_ = json.Unmarshal(request(other, "POST", "/api/charts", input, 201), &expiring)
	_, err = db.Exec(context.Background(), "UPDATE sessions SET expires_at=now()-interval '1 minute'")
	if err != nil {
		t.Fatal(err)
	}
	if err = Cleanup(context.Background(), db); err != nil {
		t.Fatal(err)
	}
	var guestExists, accountExists bool
	err = db.QueryRow(context.Background(), "SELECT EXISTS(SELECT 1 FROM charts WHERE id=$1),EXISTS(SELECT 1 FROM charts WHERE id=$2)", expiring.ID, second.ID).Scan(&guestExists, &accountExists)
	if err != nil || guestExists || !accountExists {
		t.Fatalf("cleanup removed account data or retained expired guest data: %v", err)
	}
}
func TestInputAndCookieProtection(t *testing.T) {
	db := testDB(t)
	s := New(db, fixtureProvider{}, true)
	srv := httptest.NewServer(s.Handler())
	defer srv.Close()
	resp, err := http.Get(srv.URL + "/api/session")
	if err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()
	cookies := resp.Cookies()
	if len(cookies) != 1 || cookies[0].Name != "__Host-starmora_session" || !cookies[0].HttpOnly || !cookies[0].Secure || cookies[0].SameSite != http.SameSiteLaxMode {
		t.Fatal("session cookie protections missing")
	}
	for _, body := range []string{`{}`, `{"name":"XX","email":"bad","password":"short"}`, `{"name":"XX","email":"a@b.com","password":"long-enough-password","unknown":1}`, `{} {}`} {
		req, _ := http.NewRequest("POST", srv.URL+"/api/auth/register", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		r, e := http.DefaultClient.Do(req)
		if e != nil {
			t.Fatal(e)
		}
		r.Body.Close()
		if r.StatusCode != 400 {
			t.Fatal(fmt.Sprintf("invalid body accepted: %s", body))
		}
	}
}
