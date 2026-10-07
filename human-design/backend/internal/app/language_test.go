package app

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/cookiejar"
	"net/http/httptest"
	"reflect"
	"strings"
	"testing"
)

func TestEnglishEditorialCompletenessAndParity(t *testing.T) {
	for name, maps := range map[string][2]map[string]theme{"type": {typeThemes, englishTypeThemes}, "authority": {authorityThemes, englishAuthorityThemes}, "center": {centerThemes, englishCenterThemes}, "channel": {channelThemes, englishChannelThemes}} {
		if len(maps[0]) != len(maps[1]) {
			t.Fatalf("%s size differs", name)
		}
		for key := range maps[0] {
			v, ok := maps[1][key]
			if !ok || v.title == "" || v.body == "" || v.practice == "" || v.question == "" {
				t.Fatalf("%s missing %s", name, key)
			}
		}
	}
	if len(englishGateThemes) != 64 || len(englishLineThemes) != 6 || len(englishPlanetThemes) != 13 {
		t.Fatal("incomplete English dictionary")
	}
	for gate := 1; gate <= 64; gate++ {
		v := englishGateThemes[gate]
		if v.title == "" || v.body == "" || v.practice == "" || v.question == "" {
			t.Fatalf("gate %d", gate)
		}
	}
	r, err := NewLocal().Calculate(context.Background(), Birth{"2019-05-05", "10:10", "London, GB", "Europe/London"})
	if err != nil {
		t.Fatal(err)
	}
	before, _ := json.Marshal(r)
	tr := GenerateReadingLanguage(r, "tr")
	en := GenerateReadingLanguage(r, "en")
	after, _ := json.Marshal(r)
	if string(before) != string(after) {
		t.Fatal("localization mutated chart")
	}
	if en.Version != "starmora-en-1" || len(en.Sections) != 7 || len(en.Centers) != 9 || len(en.Gates) != len(tr.Gates) || len(en.Channels) != len(tr.Channels) || len(en.Practice) != 7 {
		t.Fatal("reading parity failed")
	}
	if !reflect.DeepEqual(en, GenerateReadingLanguage(r, "en")) {
		t.Fatal("nondeterministic English output")
	}
	encoded, _ := json.Marshal(en)
	if strings.ContainsAny(string(encoded), "ğĞşŞıİçÇöÖüÜ") {
		t.Fatal("Turkish text in English reading")
	}
	for i, s := range en.Sections {
		if s.ID != tr.Sections[i].ID {
			t.Fatal("unstable section IDs")
		}
	}
}
func TestLanguageNegotiation(t *testing.T) {
	for _, test := range []struct{ query, header, want string }{{"", "en-US,en;q=0.9", "en"}, {"", "en;q=0,tr;q=0.8", "tr"}, {"", "tr;q=0.3,en;q=0.8", "en"}, {"?lang=tr", "en", "tr"}, {"?lang=xx", "en", "xx"}, {"", "de", "tr"}} {
		r := httptest.NewRequest("GET", "/api/session"+test.query, nil)
		r.Header.Set("Accept-Language", test.header)
		if requestLanguage(r) != test.want {
			t.Fatalf("%+v", test)
		}
	}
	recorder := httptest.NewRecorder()
	w := &languageWriter{recorder, "en"}
	failure(w, 400, "Geçersiz istek.")
	if !strings.Contains(recorder.Body.String(), englishErrors["Geçersiz istek."]) {
		t.Fatal("untranslated error")
	}
}
func TestLocalizedAPIAndExport(t *testing.T) {
	db := testDB(t)
	srv := httptest.NewServer(New(db, NewLocal(), false).Handler())
	defer srv.Close()
	jar, _ := cookiejar.New(nil)
	client := &http.Client{Jar: jar}
	response, err := client.Get(srv.URL + "/api/session?lang=en")
	if err != nil {
		t.Fatal(err)
	}
	response.Body.Close()
	payload := `{"name":"Language test","birth":{"date":"2019-05-05","time":"10:10","place":"London, GB","timezone":"Europe/London"}}`
	response, err = client.Post(srv.URL+"/api/charts?lang=en", "application/json", strings.NewReader(payload))
	if err != nil {
		t.Fatal(err)
	}
	var chart Chart
	if response.StatusCode != 201 {
		t.Fatalf("create %d", response.StatusCode)
	}
	json.NewDecoder(response.Body).Decode(&chart)
	response.Body.Close()
	for _, lang := range []string{"tr", "en"} {
		response, err = client.Get(srv.URL + "/api/charts/" + chart.ID + "/export?lang=" + lang)
		if err != nil {
			t.Fatal(err)
		}
		var exported struct {
			Chart
			Reading Reading `json:"reading"`
		}
		if response.StatusCode != 200 || response.Header.Get("Content-Language") != lang || response.Header.Get("Cache-Control") != "no-store" {
			t.Fatalf("export headers %s %d", lang, response.StatusCode)
		}
		if err = json.NewDecoder(response.Body).Decode(&exported); err != nil {
			t.Fatal(err)
		}
		response.Body.Close()
		if exported.Reading.Version != "starmora-"+lang+"-1" {
			t.Fatalf("export language %s", exported.Reading.Version)
		}
	}
	response, _ = client.Post(srv.URL+"/api/charts?lang=en", "application/json", strings.NewReader(`{}`))
	var failure struct {
		Error string `json:"error"`
	}
	json.NewDecoder(response.Body).Decode(&failure)
	response.Body.Close()
	if response.StatusCode != 400 || failure.Error != englishErrors["Harita adı 2–100 karakter olmalı."] {
		t.Fatalf("English error %+v", failure)
	}
	response, _ = client.Get(srv.URL + "/api/session?lang=xx")
	response.Body.Close()
	if response.StatusCode != 400 || response.Header.Get("X-Robots-Tag") == "" || response.Header.Get("Cache-Control") != "no-store" {
		t.Fatal("invalid language missing private headers")
	}
}
