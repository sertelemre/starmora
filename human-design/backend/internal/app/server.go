package app

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"embed"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/mail"
	"net/url"
	"strings"
	"sync"
	"time"
	"unicode/utf8"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

//go:embed migrations/*.sql
var migrations embed.FS

func Migrate(ctx context.Context, db *pgxpool.Pool) error {
	sql, err := migrations.ReadFile("migrations/001_init.sql")
	if err != nil {
		return err
	}
	_, err = db.Exec(ctx, string(sql))
	return err
}

type User struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}
type session struct {
	ID   string
	User *User
}

func (s session) Owner() string {
	if s.User != nil {
		return s.User.ID
	}
	return s.ID
}

type Chart struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Birth     Birth     `json:"birth"`
	Result    Result    `json:"result"`
	Provider  string    `json:"provider"`
	CreatedAt time.Time `json:"createdAt"`
}
type bucket struct {
	Count int
	Start time.Time
}
type Server struct {
	DB         *pgxpool.Pool
	Provider   Provider
	Secure     bool
	TrustProxy bool
	mu         sync.Mutex
	limits     map[string]bucket
	dummyHash  []byte
}

func New(db *pgxpool.Pool, p Provider, secure bool) *Server {
	dummy, _ := bcrypt.GenerateFromPassword([]byte("non-user-timing-placeholder"), 12)
	return &Server{DB: db, Provider: p, Secure: secure, limits: map[string]bucket{}, dummyHash: dummy}
}
func uuid() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	b[6] = (b[6] & 15) | 64
	b[8] = (b[8] & 63) | 128
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[:4], b[4:6], b[6:8], b[8:10], b[10:])
}
func token() (string, string) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	t := hex.EncodeToString(b)
	return t, hash(t)
}
func hash(t string) string { v := sha256.Sum256([]byte(t)); return hex.EncodeToString(v[:]) }
func respond(w http.ResponseWriter, status int, v any) {
	if responseLanguage(w) == "en" {
		switch value := v.(type) {
		case Chart:
			value.Result = localizeResult(value.Result, "en")
			v = value
		case []Chart:
			localized := make([]Chart, len(value))
			copy(localized, value)
			for i := range localized {
				localized[i].Result = localizeResult(localized[i].Result, "en")
			}
			v = localized
		}
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
func failure(w http.ResponseWriter, status int, message string) {
	source := message
	if responseLanguage(w) == "en" {
		if translated, ok := englishErrors[message]; ok {
			message = translated
		} else {
			message = "The request could not be completed. Please try again."
		}
	}
	respond(w, status, map[string]string{"error": message, "errorKey": source})
}
func decode(w http.ResponseWriter, r *http.Request, v any) bool {
	if !strings.HasPrefix(r.Header.Get("Content-Type"), "application/json") {
		failure(w, 415, "JSON içerik gönderin.")
		return false
	}
	r.Body = http.MaxBytesReader(w, r.Body, 16*1024)
	d := json.NewDecoder(r.Body)
	d.DisallowUnknownFields()
	if d.Decode(v) != nil {
		failure(w, 400, "Geçersiz istek.")
		return false
	}
	var extra any
	if d.Decode(&extra) != io.EOF {
		failure(w, 400, "Tek bir JSON nesnesi gönderin.")
		return false
	}
	return true
}
func (s *Server) Handler() http.Handler {
	m := http.NewServeMux()
	m.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()
		if s.DB.Ping(ctx) != nil {
			failure(w, 503, "Veritabanına erişilemiyor.")
			return
		}
		respond(w, 200, map[string]string{"status": "ok"})
	})
	m.HandleFunc("GET /api/session", s.current)
	m.HandleFunc("POST /api/auth/register", s.register)
	m.HandleFunc("POST /api/auth/login", s.login)
	m.HandleFunc("POST /api/auth/logout", s.logout)
	m.HandleFunc("GET /api/locations", s.locations)
	m.HandleFunc("GET /api/charts", s.list)
	m.HandleFunc("POST /api/charts", s.create)
	m.HandleFunc("GET /api/charts/{id}", s.get)
	m.HandleFunc("GET /api/charts/{id}/export", s.export)
	m.HandleFunc("GET /api/charts/{id}/reading", s.reading)
	m.HandleFunc("DELETE /api/charts/{id}", s.delete)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		language := requestLanguage(r)
		w = &languageWriter{w, language}
		w.Header().Set("Content-Language", language)
		w.Header().Set("Vary", "Accept-Language")
		w.Header().Set("X-Robots-Tag", "noindex, nofollow")
		w.Header().Set("Cache-Control", "no-store")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Referrer-Policy", "no-referrer")
		if language != "tr" && language != "en" {
			w = &languageWriter{w, "en"}
			w.Header().Set("Content-Language", "en")
			failure(w, 400, "Desteklenmeyen dil. tr veya en kullanın.")
			return
		}
		if r.Method != "GET" && r.Method != "HEAD" {
			if origin := r.Header.Get("Origin"); origin != "" {
				u, err := url.Parse(origin)
				if err != nil || u.Host != r.Host {
					failure(w, 403, "İstek kaynağı geçersiz.")
					return
				}
			}
			if r.Header.Get("Sec-Fetch-Site") == "cross-site" {
				failure(w, 403, "İstek kaynağı geçersiz.")
				return
			}
		}
		if r.URL.Path != "/api/health" && !s.allow(r) {
			failure(w, 429, "Çok fazla istek. Birkaç dakika sonra tekrar deneyin.")
			return
		}
		m.ServeHTTP(w, r)
	})
}
func (s *Server) allow(r *http.Request) bool {
	ip, _, _ := net.SplitHostPort(r.RemoteAddr)
	if s.TrustProxy {
		if forwarded := net.ParseIP(r.Header.Get("X-Real-IP")); forwarded != nil {
			ip = forwarded.String()
		}
	}
	key := ip
	max := 300
	if strings.HasPrefix(r.URL.Path, "/api/auth/") {
		key += "auth"
		max = 20
	}
	if r.Method == "POST" && r.URL.Path == "/api/charts" {
		key += "calculate"
		max = 30
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now()
	for k, b := range s.limits {
		if now.Sub(b.Start) > 10*time.Minute {
			delete(s.limits, k)
		}
	}
	b, ok := s.limits[key]
	if !ok {
		if len(s.limits) >= 10000 {
			return false
		}
		b = bucket{Start: now}
	}
	b.Count++
	s.limits[key] = b
	return b.Count <= max
}

// Expired guest data is removed; account charts remain attached to users.
func Cleanup(ctx context.Context, db *pgxpool.Pool) error {
	tx, err := db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	if _, err = tx.Exec(ctx, `DELETE FROM charts c WHERE NOT EXISTS(SELECT 1 FROM users u WHERE u.id=c.owner_id) AND NOT EXISTS(SELECT 1 FROM sessions s WHERE s.id=c.owner_id AND s.expires_at>now())`); err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, "DELETE FROM sessions WHERE expires_at<=now()"); err != nil {
		return err
	}
	return tx.Commit(ctx)
}
func (s *Server) setCookie(w http.ResponseWriter, t string) {
	http.SetCookie(w, &http.Cookie{Name: s.cookieName(), Value: t, Path: "/", HttpOnly: true, Secure: s.Secure, SameSite: http.SameSiteLaxMode, MaxAge: 30 * 24 * 3600})
}
func (s *Server) cookieName() string {
	if s.Secure {
		return "__Host-starmora_session"
	}
	return "starmora_session"
}
func (s *Server) newSession(ctx context.Context, w http.ResponseWriter) (session, error) {
	id := uuid()
	t, h := token()
	_, err := s.DB.Exec(ctx, "INSERT INTO sessions(id,token_hash,expires_at) VALUES($1,$2,now()+interval '30 days')", id, h)
	if err != nil {
		return session{}, err
	}
	s.setCookie(w, t)
	return session{ID: id}, nil
}
func (s *Server) session(w http.ResponseWriter, r *http.Request) (session, error) {
	if c, err := r.Cookie(s.cookieName()); err == nil && len(c.Value) == 64 {
		var id string
		var uid, name, email *string
		err = s.DB.QueryRow(r.Context(), "SELECT s.id::text,u.id::text,u.name,u.email FROM sessions s LEFT JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()", hash(c.Value)).Scan(&id, &uid, &name, &email)
		if err == nil {
			ss := session{ID: id}
			if uid != nil {
				ss.User = &User{*uid, *name, *email}
			}
			return ss, nil
		}
		if !errors.Is(err, pgx.ErrNoRows) {
			return session{}, err
		}
	}
	return s.newSession(r.Context(), w)
}
func (s *Server) requireSession(w http.ResponseWriter, r *http.Request) (session, bool) {
	ss, err := s.session(w, r)
	if err != nil {
		failure(w, 503, "Oturum oluşturulamadı.")
		return ss, false
	}
	return ss, true
}
func (s *Server) current(w http.ResponseWriter, r *http.Request) {
	ss, ok := s.requireSession(w, r)
	if !ok {
		return
	}
	respond(w, 200, map[string]any{"user": ss.User, "providerReady": s.Provider.Ready(), "provider": s.Provider.Name()})
}

type credentials struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func normalizeEmail(v string) (string, bool) {
	v = strings.ToLower(strings.TrimSpace(v))
	a, e := mail.ParseAddress(v)
	return v, e == nil && a.Address == v && len(v) <= 254
}

// Rotate the session and atomically claim guest charts. Existing signed-in
// accounts never transfer their charts into another account.
func (s *Server) authenticate(ctx context.Context, w http.ResponseWriter, ss session, u User, tx pgx.Tx) error {
	var lockedID string
	if err := tx.QueryRow(ctx, "SELECT id::text FROM sessions WHERE id=$1 AND expires_at>now() FOR UPDATE", ss.ID).Scan(&lockedID); err != nil {
		return err
	}
	id := uuid()
	t, h := token()
	if ss.User == nil {
		if _, err := tx.Exec(ctx, "UPDATE charts SET owner_id=$1 WHERE owner_id=$2", u.ID, ss.ID); err != nil {
			return err
		}
	}
	if _, err := tx.Exec(ctx, "DELETE FROM sessions WHERE id=$1", ss.ID); err != nil {
		return err
	}
	if _, err := tx.Exec(ctx, "INSERT INTO sessions(id,token_hash,user_id,expires_at) VALUES($1,$2,$3,now()+interval '30 days')", id, h, u.ID); err != nil {
		return err
	}
	if err := tx.Commit(ctx); err != nil {
		return err
	}
	s.setCookie(w, t)
	return nil
}
func (s *Server) register(w http.ResponseWriter, r *http.Request) {
	var in credentials
	if !decode(w, r, &in) {
		return
	}
	email, valid := normalizeEmail(in.Email)
	in.Name = strings.TrimSpace(in.Name)
	if !valid || utf8.RuneCountInString(in.Name) < 2 || utf8.RuneCountInString(in.Name) > 100 || utf8.RuneCountInString(in.Password) < 10 || len(in.Password) > 72 {
		failure(w, 400, "Adınızı ve geçerli e-postanızı girin. Şifre en az 10 karakter olmalı; çok uzun şifreleri kısaltın.")
		return
	}
	ss, ok := s.requireSession(w, r)
	if !ok {
		return
	}
	if ss.User != nil {
		failure(w, 409, "Önce mevcut hesabınızdan çıkış yapın.")
		return
	}
	h, err := bcrypt.GenerateFromPassword([]byte(in.Password), 12)
	if err != nil {
		failure(w, 500, "Kayıt tamamlanamadı.")
		return
	}
	tx, err := s.DB.Begin(r.Context())
	if err != nil {
		failure(w, 503, "Veritabanına erişilemiyor.")
		return
	}
	defer tx.Rollback(r.Context())
	u := User{uuid(), in.Name, email}
	_, err = tx.Exec(r.Context(), "INSERT INTO users(id,name,email,password_hash) VALUES($1,$2,$3,$4)", u.ID, u.Name, u.Email, string(h))
	if err != nil {
		var exists bool
		_ = s.DB.QueryRow(r.Context(), "SELECT EXISTS(SELECT 1 FROM users WHERE email=$1)", email).Scan(&exists)
		if exists {
			failure(w, 409, "Bu e-posta ile bir hesap var. Giriş yapabilirsiniz.")
		} else {
			failure(w, 503, "Kayıt tamamlanamadı.")
		}
		return
	}
	if s.authenticate(r.Context(), w, ss, u, tx) != nil {
		failure(w, 503, "Kayıt tamamlanamadı.")
		return
	}
	respond(w, 201, map[string]any{"user": u})
}
func (s *Server) login(w http.ResponseWriter, r *http.Request) {
	var in credentials
	if !decode(w, r, &in) {
		return
	}
	email, valid := normalizeEmail(in.Email)
	if !valid || len(in.Password) > 72 {
		failure(w, 401, "E-posta veya şifre hatalı.")
		return
	}
	var u User
	var h string
	err := s.DB.QueryRow(r.Context(), "SELECT id::text,name,email,password_hash FROM users WHERE email=$1", email).Scan(&u.ID, &u.Name, &u.Email, &h)
	if errors.Is(err, pgx.ErrNoRows) {
		_ = bcrypt.CompareHashAndPassword(s.dummyHash, []byte(in.Password))
		failure(w, 401, "E-posta veya şifre hatalı.")
		return
	}
	if err != nil {
		failure(w, 503, "Giriş yapılamadı.")
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(h), []byte(in.Password)) != nil {
		failure(w, 401, "E-posta veya şifre hatalı.")
		return
	}
	ss, ok := s.requireSession(w, r)
	if !ok {
		return
	}
	tx, err := s.DB.Begin(r.Context())
	if err != nil {
		failure(w, 503, "Giriş yapılamadı.")
		return
	}
	defer tx.Rollback(r.Context())
	if s.authenticate(r.Context(), w, ss, u, tx) != nil {
		failure(w, 503, "Giriş yapılamadı.")
		return
	}
	respond(w, 200, map[string]any{"user": u})
}
func (s *Server) logout(w http.ResponseWriter, r *http.Request) {
	if c, err := r.Cookie(s.cookieName()); err == nil {
		if _, err = s.DB.Exec(r.Context(), "DELETE FROM sessions WHERE token_hash=$1", hash(c.Value)); err != nil {
			failure(w, 503, "Çıkış yapılamadı.")
			return
		}
	}
	http.SetCookie(w, &http.Cookie{Name: s.cookieName(), Value: "", Path: "/", HttpOnly: true, Secure: s.Secure, SameSite: http.SameSiteLaxMode, MaxAge: -1})
	respond(w, 200, map[string]bool{"ok": true})
}
func (s *Server) locations(w http.ResponseWriter, r *http.Request) {
	q := strings.TrimSpace(r.URL.Query().Get("q"))
	if len(q) < 2 || len(q) > 100 {
		failure(w, 400, "En az iki harf girin.")
		return
	}
	out, err := s.Provider.Locations(r.Context(), q)
	if err != nil {
		s.providerError(w, err)
		return
	}
	respond(w, 200, out)
}
func (s *Server) providerError(w http.ResponseWriter, err error) {
	if errors.Is(err, ErrUnconfigured) {
		failure(w, 503, "Harita hesaplama henüz etkin değil. Sağlayıcı bağlantısı bekleniyor.")
	} else {
		failure(w, 502, "Harita hesaplaması tamamlanamadı. Lütfen tekrar deneyin.")
	}
}
func (s *Server) create(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Name  string `json:"name"`
		Birth Birth  `json:"birth"`
	}
	if !decode(w, r, &in) {
		return
	}
	in.Name = strings.TrimSpace(in.Name)
	if utf8.RuneCountInString(in.Name) < 2 || utf8.RuneCountInString(in.Name) > 100 {
		failure(w, 400, "Harita adı 2–100 karakter olmalı.")
		return
	}
	if err := in.Birth.Validate(); err != nil {
		failure(w, 400, err.Error())
		return
	}
	ss, ok := s.requireSession(w, r)
	if !ok {
		return
	}
	result, err := s.Provider.Calculate(r.Context(), in.Birth)
	if err != nil {
		s.providerError(w, err)
		return
	}
	c := Chart{ID: uuid(), Name: in.Name, Birth: in.Birth, Result: result, Provider: s.Provider.Name(), CreatedAt: time.Now().UTC()}
	b, _ := json.Marshal(c.Birth)
	data, _ := json.Marshal(c.Result)
	tag, err := s.DB.Exec(r.Context(), "INSERT INTO charts(id,owner_id,name,birth,result,provider,created_at) SELECT $1::uuid,$2::uuid,$3::text,$4::jsonb,$5::jsonb,$6::text,$7::timestamptz WHERE EXISTS(SELECT 1 FROM sessions WHERE id=$8 AND expires_at>now())", c.ID, ss.Owner(), c.Name, b, data, c.Provider, c.CreatedAt, ss.ID)
	if err != nil {
		failure(w, 503, "Harita kaydedilemedi. Lütfen tekrar deneyin.")
		return
	}
	if tag.RowsAffected() == 0 {
		failure(w, 409, "Oturum hesaplama sırasında değişti. Lütfen tekrar deneyin.")
		return
	}
	respond(w, 201, c)
}
func scanChart(row interface{ Scan(...any) error }) (Chart, error) {
	var c Chart
	var b, data []byte
	err := row.Scan(&c.ID, &c.Name, &b, &data, &c.Provider, &c.CreatedAt)
	if err != nil {
		return c, err
	}
	if err = json.Unmarshal(b, &c.Birth); err != nil {
		return c, err
	}
	err = json.Unmarshal(data, &c.Result)
	return c, err
}
func (s *Server) list(w http.ResponseWriter, r *http.Request) {
	ss, ok := s.requireSession(w, r)
	if !ok {
		return
	}
	query := "SELECT id::text,name,birth,result,provider,created_at FROM charts WHERE owner_id=$1"
	args := []any{ss.Owner()}
	if before := r.URL.Query().Get("before"); before != "" {
		timestamp, err := time.Parse(time.RFC3339Nano, before)
		id := r.URL.Query().Get("beforeId")
		if err != nil || !validID(id) {
			failure(w, 400, "Geçersiz harita sayfası.")
			return
		}
		query += " AND (created_at,id)<($2,$3)"
		args = append(args, timestamp, id)
	}
	query += " ORDER BY created_at DESC,id DESC LIMIT 100"
	rows, err := s.DB.Query(r.Context(), query, args...)
	if err != nil {
		failure(w, 503, "Haritalar yüklenemedi.")
		return
	}
	defer rows.Close()
	out := []Chart{}
	for rows.Next() {
		c, e := scanChart(rows)
		if e != nil {
			failure(w, 500, "Harita okunamadı.")
			return
		}
		out = append(out, c)
	}
	if rows.Err() != nil {
		failure(w, 503, "Haritalar yüklenemedi.")
		return
	}
	respond(w, 200, out)
}
func validID(s string) bool {
	if len(s) != 36 {
		return false
	}
	for i, c := range s {
		if i == 8 || i == 13 || i == 18 || i == 23 {
			if c != '-' {
				return false
			}
		} else if !strings.ContainsRune("0123456789abcdef", c) {
			return false
		}
	}
	return true
}
func (s *Server) get(w http.ResponseWriter, r *http.Request) {
	s.readChart(w, r, "chart")
}
func (s *Server) export(w http.ResponseWriter, r *http.Request)  { s.readChart(w, r, "export") }
func (s *Server) reading(w http.ResponseWriter, r *http.Request) { s.readChart(w, r, "reading") }
func (s *Server) readChart(w http.ResponseWriter, r *http.Request, mode string) {
	if !validID(r.PathValue("id")) {
		failure(w, 404, "Harita bulunamadı.")
		return
	}
	ss, ok := s.requireSession(w, r)
	if !ok {
		return
	}
	c, err := scanChart(s.DB.QueryRow(r.Context(), "SELECT id::text,name,birth,result,provider,created_at FROM charts WHERE id=$1 AND owner_id=$2", r.PathValue("id"), ss.Owner()))
	if errors.Is(err, pgx.ErrNoRows) {
		failure(w, 404, "Harita bulunamadı.")
		return
	}
	if err != nil {
		failure(w, 503, "Harita yüklenemedi.")
		return
	}
	if mode == "reading" {
		respond(w, 200, GenerateReadingLanguage(c.Result, responseLanguage(w)))
		return
	}
	if mode == "export" {
		w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"starmora-%s.json\"", c.ID))
		reading := GenerateReadingLanguage(c.Result, responseLanguage(w))
		c.Result = localizeResult(c.Result, responseLanguage(w))
		respond(w, 200, struct {
			Chart
			Reading Reading `json:"reading"`
		}{c, reading})
		return
	}
	respond(w, 200, c)
}
func (s *Server) delete(w http.ResponseWriter, r *http.Request) {
	if !validID(r.PathValue("id")) {
		failure(w, 404, "Harita bulunamadı.")
		return
	}
	ss, ok := s.requireSession(w, r)
	if !ok {
		return
	}
	tag, err := s.DB.Exec(r.Context(), "DELETE FROM charts WHERE id=$1 AND owner_id=$2", r.PathValue("id"), ss.Owner())
	if err != nil {
		failure(w, 503, "Harita silinemedi.")
		return
	}
	if tag.RowsAffected() == 0 {
		failure(w, 404, "Harita bulunamadı.")
		return
	}
	w.WriteHeader(204)
}
