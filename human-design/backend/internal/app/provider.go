package app

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"time"
	_ "time/tzdata"
)

type Birth struct {
	Date     string `json:"date"`
	Time     string `json:"time"`
	Place    string `json:"place"`
	Timezone string `json:"timezone"`
}
type Activation struct {
	Gate      int     `json:"gate"`
	Line      int     `json:"line"`
	Longitude float64 `json:"longitude,omitempty"`
}
type Result struct {
	Type        string                `json:"type"`
	Strategy    string                `json:"strategy"`
	Authority   string                `json:"authority"`
	Profile     string                `json:"profile"`
	Definition  string                `json:"definition"`
	Cross       string                `json:"cross"`
	Centers     []string              `json:"centers"`
	Gates       []int                 `json:"gates"`
	Channels    []string              `json:"channels"`
	Personality map[string]Activation `json:"personality"`
	Design      map[string]Activation `json:"design"`
	Engine      string                `json:"engine,omitempty"`
	BirthUTC    string                `json:"birthUtc,omitempty"`
	DesignUTC   string                `json:"designUtc,omitempty"`
	NodeMethod  string                `json:"nodeMethod,omitempty"`
	Warnings    []string              `json:"warnings,omitempty"`
}
type Location struct {
	Value    string `json:"value"`
	Timezone string `json:"timezone"`
}
type Provider interface {
	Calculate(context.Context, Birth) (Result, error)
	Locations(context.Context, string) ([]Location, error)
	Ready() bool
	Name() string
}
type Bodygraph struct {
	Key     string
	BaseURL string
	Client  *http.Client
}

func (p *Bodygraph) Ready() bool  { return p.Key != "" }
func (p *Bodygraph) Name() string { return "bodygraph" }

var ErrUnconfigured = errors.New("provider unconfigured")

// Validate a local wall time using historical IANA rules. Reject skipped and
// repeated DST times instead of silently selecting a different birth instant.
func (b Birth) Validate() error { _, err := b.Instant(); return err }

// Enumerate actual zone periods, including date-line and fractional-hour
// changes. A fixed +/-1 hour DST heuristic misses historical 23-hour folds.
func (b Birth) Instant() (time.Time, error) {
	if len(b.Place) < 2 || len(b.Place) > 200 || len(b.Timezone) > 100 {
		return time.Time{}, errors.New("Doğum yeri ve saat dilimini seçin.")
	}
	loc, err := time.LoadLocation(b.Timezone)
	if err != nil || b.Timezone == "Local" {
		return time.Time{}, errors.New("Geçerli bir IANA saat dilimi seçin.")
	}
	input := b.Date + " " + b.Time
	wall, err := time.Parse("2006-01-02 15:04", input)
	if err != nil || wall.Format("2006-01-02 15:04") != input || wall.Year() < 1900 {
		return time.Time{}, errors.New("Doğum tarihi veya saati geçersiz. Tarih 1900 ile bugün arasında olmalı.")
	}
	offsets := map[int]bool{}
	probe := wall.Add(-72 * time.Hour)
	limit := wall.Add(72 * time.Hour)
	for probe.Before(limit) {
		local := probe.In(loc)
		_, offset := local.Zone()
		offsets[offset] = true
		_, end := local.ZoneBounds()
		if end.IsZero() || !end.After(probe) {
			break
		}
		probe = end
	}
	candidates := []time.Time{}
	for offset := range offsets {
		candidate := wall.Add(-time.Duration(offset) * time.Second)
		if candidate.In(loc).Format("2006-01-02 15:04") == input {
			candidates = append(candidates, candidate)
		}
	}
	if len(candidates) == 0 {
		return time.Time{}, errors.New("Bu yerel saat, saat dilimi değişiminde atlanmış. Doğum saatini kontrol edin.")
	}
	if len(candidates) > 1 {
		return time.Time{}, errors.New("Bu yerel saat, saat dilimi değişiminde iki kez yaşanmış. Kesin UTC saatini öğrenip elle girişte UTC saat dilimini seçin.")
	}
	if candidates[0].After(time.Now()) {
		return time.Time{}, errors.New("Doğum tarihi gelecekte olamaz.")
	}
	return candidates[0].UTC(), nil
}

func (p *Bodygraph) request(ctx context.Context, path string, q url.Values, out any) error {
	if !p.Ready() {
		return ErrUnconfigured
	}
	base := p.BaseURL
	if base == "" {
		base = "https://api.bodygraphchart.com"
	}
	q.Set("api_key", p.Key) // Provider's documented protocol; never log request URLs.
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, base+path+"?"+q.Encode(), nil)
	if err != nil {
		return errors.New("provider request invalid")
	}
	c := p.Client
	if c == nil {
		c = &http.Client{Timeout: 15 * time.Second, CheckRedirect: func(_ *http.Request, _ []*http.Request) error { return http.ErrUseLastResponse }}
	}
	resp, err := c.Do(req)
	if err != nil {
		return errors.New("provider unavailable")
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return fmt.Errorf("provider status %d", resp.StatusCode)
	}
	data, err := io.ReadAll(io.LimitReader(resp.Body, 2*1024*1024+1))
	if err != nil || len(data) > 2*1024*1024 {
		return errors.New("provider response invalid")
	}
	if json.Unmarshal(data, out) != nil {
		return errors.New("provider response invalid")
	}
	return nil
}
func (p *Bodygraph) Locations(ctx context.Context, q string) ([]Location, error) {
	out := []Location{}
	err := p.request(ctx, "/v210502/locations", url.Values{"query": {q}}, &out)
	return out, err
}
func (p *Bodygraph) Calculate(ctx context.Context, b Birth) (Result, error) {
	var raw struct {
		Properties map[string]struct {
			ID string `json:"id"`
		} `json:"Properties"`
		DefinedCenters []string `json:"DefinedCenters"`
		Channels       []string `json:"Channels"`
		Personality    map[string]struct {
			Gate int
			Line int
		} `json:"Personality"`
		Design map[string]struct {
			Gate int
			Line int
		} `json:"Design"`
	}
	err := p.request(ctx, "/v221006/hd-data", url.Values{"date": {b.Date + " " + b.Time}, "timezone": {b.Timezone}}, &raw)
	if err != nil {
		return Result{}, err
	}
	r := Result{Type: raw.Properties["Type"].ID, Strategy: raw.Properties["Strategy"].ID, Authority: raw.Properties["InnerAuthority"].ID, Profile: raw.Properties["Profile"].ID, Definition: raw.Properties["Definition"].ID, Cross: raw.Properties["IncarnationCross"].ID, Centers: []string{}, Channels: []string{}, Gates: []int{}, Personality: map[string]Activation{}, Design: map[string]Activation{}}
	if r.Type == "" || r.Profile == "" || r.Authority == "" || len(raw.Personality) == 0 || len(raw.Design) == 0 {
		return Result{}, errors.New("provider missing required chart data")
	}
	gates := map[int]bool{}
	for _, layer := range []struct {
		source map[string]struct {
			Gate int
			Line int
		}
		dest map[string]Activation
	}{{raw.Personality, r.Personality}, {raw.Design, r.Design}} {
		for _, planet := range []string{"Sun", "Earth", "North Node", "South Node", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"} {
			if _, ok := layer.source[planet]; !ok {
				return Result{}, errors.New("provider missing planetary activation")
			}
		}
		for planet, a := range layer.source {
			if planet == "Chiron" {
				continue
			} // Not part of the traditional 13 activations.
			if a.Gate < 1 || a.Gate > 64 || a.Line < 1 || a.Line > 6 {
				return Result{}, errors.New("provider activation out of range")
			}
			layer.dest[planet] = Activation{Gate: a.Gate, Line: a.Line}
			gates[a.Gate] = true
		}
	}
	for g := range gates {
		r.Gates = append(r.Gates, g)
	}
	sort.Ints(r.Gates)
	for _, center := range raw.DefinedCenters {
		r.Centers = append(r.Centers, strings.TrimSuffix(strings.ToLower(center), " center"))
	}
	for _, channel := range raw.Channels {
		r.Channels = append(r.Channels, strings.ReplaceAll(channel, " ", ""))
	}
	return r, nil
}
