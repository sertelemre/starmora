package app

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestBirthHistoricalTimezone(t *testing.T) {
	cases := []struct {
		name, date, time, zone string
		valid                  bool
	}{
		{"Istanbul before permanent UTC3", "1990-01-01", "12:00", "Europe/Istanbul", true},
		{"Istanbul current", "2020-01-01", "12:00", "Europe/Istanbul", true},
		{"DST gap", "2024-03-10", "02:30", "America/New_York", false},
		{"DST fold", "2024-11-03", "01:30", "America/New_York", false},
		{"half hour fold", "2024-04-07", "01:45", "Australia/Lord_Howe", false},
		{"23 hour date-line fold", "1969-09-30", "12:00", "Pacific/Kwajalein", false},
		{"skipped civil date", "2011-12-30", "12:00", "Pacific/Apia", false},
		{"invalid calendar", "2024-02-30", "12:00", "Europe/Istanbul", false},
		{"future", "2999-01-01", "12:00", "Europe/Istanbul", false},
		{"unknown timezone", "1990-01-01", "12:00", "Mars/Olympus", false},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			err := (Birth{Date: c.date, Time: c.time, Place: "Test city", Timezone: c.zone}).Validate()
			if (err == nil) != c.valid {
				t.Fatalf("valid=%v error=%v", c.valid, err)
			}
		})
	}
}
func TestBodygraphProtocol(t *testing.T) {
	personality := map[string]any{"Chiron": map[string]int{"Gate": 25, "Line": 1}}
	design := map[string]any{}
	for _, planet := range []string{"Sun", "Earth", "North Node", "South Node", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"} {
		personality[planet] = map[string]int{"Gate": 3, "Line": 1}
		design[planet] = map[string]int{"Gate": 60, "Line": 3}
	}
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v221006/hd-data" || r.URL.Query().Get("api_key") != "test-secret" || r.URL.Query().Get("date") != "1990-01-01 12:00" || r.URL.Query().Get("timezone") != "Europe/Istanbul" {
			t.Errorf("incorrect provider protocol")
		}
		_ = json.NewEncoder(w).Encode(map[string]any{"Properties": map[string]any{"Type": map[string]string{"id": "Generator"}, "Profile": map[string]string{"id": "1 / 3"}, "InnerAuthority": map[string]string{"id": "Sacral"}}, "Personality": personality, "Design": design, "DefinedCenters": []string{"sacral center", "root center"}, "Channels": []string{"3 - 60"}})
	}))
	defer upstream.Close()
	p := Bodygraph{Key: "test-secret", BaseURL: upstream.URL}
	r, err := p.Calculate(context.Background(), Birth{Date: "1990-01-01", Time: "12:00", Timezone: "Europe/Istanbul"})
	if err != nil {
		t.Fatal(err)
	}
	if r.Type != "Generator" || len(r.Gates) != 2 || r.Gates[0] != 3 || r.Gates[1] != 60 || r.Centers[0] != "sacral" || r.Channels[0] != "3-60" {
		t.Fatalf("bad normalization: %+v", r)
	}
	if _, ok := r.Personality["Chiron"]; ok {
		t.Fatal("Chiron should not be included")
	}
}
func TestBodygraphFailsClosed(t *testing.T) {
	for _, body := range []string{`{}`, `{"Properties":{"Type":{"id":"Generator"}}}`, `not-json`} {
		t.Run(body, func(t *testing.T) {
			up := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { _, _ = w.Write([]byte(body)) }))
			defer up.Close()
			p := Bodygraph{Key: "secret", BaseURL: up.URL}
			if _, err := p.Calculate(context.Background(), Birth{}); err == nil {
				t.Fatal("malformed response accepted")
			}
		})
	}
	up := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(401) }))
	up.Close()
	p := Bodygraph{Key: "never-expose-this", BaseURL: up.URL}
	_, err := p.Calculate(context.Background(), Birth{})
	if err == nil || strings.Contains(err.Error(), p.Key) {
		t.Fatal("upstream error missing or leaked key")
	}
	if _, err = (&Bodygraph{}).Calculate(context.Background(), Birth{}); err != ErrUnconfigured {
		t.Fatal("missing key must not fabricate a result")
	}
}
