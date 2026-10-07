package app

import (
	"context"
	"reflect"
	"testing"
)

func TestPublishedBodygraphReference(t *testing.T) {
	// Bodygraph's published API response: 2019-05-05 10:10 Europe/London.
	// https://bodygraph.com/docs/ -- independent, externally published fixture.
	r, err := NewLocal().Calculate(context.Background(), Birth{Date: "2019-05-05", Time: "10:10", Place: "London", Timezone: "Europe/London"})
	if err != nil {
		t.Fatal(err)
	}
	if r.Type != "Manifesting Generator" || r.Authority != "Emotional - Solar Plexus" || r.Profile != "2 / 4" || r.Definition != "Split Definition" {
		t.Fatalf("reference chart mismatch: %+v", r)
	}
	if !reflect.DeepEqual(r.Channels, []string{"3-60", "11-56", "12-22", "42-53"}) || !reflect.DeepEqual(r.Centers, []string{"ajna", "throat", "sacral", "solar plexus", "root"}) {
		t.Fatalf("reference structure mismatch: channels=%v centers=%v", r.Channels, r.Centers)
	}
	personality := map[string]Activation{"Sun": {Gate: 2, Line: 2}, "Earth": {Gate: 1, Line: 2}, "North Node": {Gate: 53, Line: 5}, "South Node": {Gate: 54, Line: 5}, "Moon": {Gate: 23, Line: 2}, "Mercury": {Gate: 3, Line: 2}, "Venus": {Gate: 51, Line: 3}, "Mars": {Gate: 12, Line: 1}, "Jupiter": {Gate: 11, Line: 1}, "Saturn": {Gate: 54, Line: 6}, "Uranus": {Gate: 27, Line: 2}, "Neptune": {Gate: 22, Line: 2}, "Pluto": {Gate: 61, Line: 3}}
	design := map[string]Activation{"Sun": {Gate: 13, Line: 4}, "Earth": {Gate: 7, Line: 4}, "North Node": {Gate: 56, Line: 1}, "South Node": {Gate: 60, Line: 1}, "Moon": {Gate: 30, Line: 2}, "Mercury": {Gate: 49, Line: 3}, "Venus": {Gate: 10, Line: 5}, "Mars": {Gate: 42, Line: 4}, "Uranus": {Gate: 3, Line: 3}, "Neptune": {Gate: 63, Line: 4}, "Pluto": {Gate: 61, Line: 2}}
	// The published example omits Design.Jupiter/Saturn. Compare every
	// activation actually present in that external example, without inventing values.
	// Erratum: the page repeats Personality.Uranus (27.2) in Design.Uranus.
	// Independent Swiss Ephemeris for 2019-02-05T17:07:26Z gives 28.984°,
	// which is Gate 3, Line 3. Use the independently verified position here.
	for planet, expected := range personality {
		a := r.Personality[planet]
		if a.Gate != expected.Gate || a.Line != expected.Line {
			t.Errorf("personality %s: got %+v expected %+v", planet, a, expected)
		}
	}
	for planet, expected := range design {
		a := r.Design[planet]
		if a.Gate != expected.Gate || a.Line != expected.Line {
			t.Errorf("design %s: got %+v expected %+v", planet, a, expected)
		}
	}
	t.Logf("reference result: type=%s profile=%s design=%s warnings=%v", r.Type, r.Profile, r.DesignUTC, r.Warnings)
}
func TestMandalaBoundaries(t *testing.T) {
	cases := []struct {
		deg        float64
		gate, line int
	}{{302, 41, 1}, {307.624999, 41, 6}, {307.625, 19, 1}, {0, 25, 2}, {360, 25, 2}, {-58, 41, 1}, {301.999999, 60, 6}}
	for _, c := range cases {
		a := activation(c.deg)
		if a.Gate != c.gate || a.Line != c.line {
			t.Errorf("%.8f => %+v; want %d.%d", c.deg, a, c.gate, c.line)
		}
	}
	seen := map[int]bool{}
	for _, g := range gateWheel {
		if seen[g] || g < 1 || g > 64 {
			t.Fatal("invalid wheel")
		}
		seen[g] = true
	}
	if len(seen) != 64 {
		t.Fatal("wheel incomplete")
	}
}
func TestAuthorityAndConnectivity(t *testing.T) {
	cases := []struct {
		name                        string
		gates                       []int
		kind, authority, definition string
	}{
		{"reflector", []int{1, 3, 4}, "Reflector", "Lunar", "No Definition"},
		{"generator", []int{3, 60}, "Generator", "Sacral", "Single Definition"},
		{"MG motor through G", []int{2, 14, 1, 8}, "Manifesting Generator", "Sacral", "Single Definition"},
		{"ego manifestor", []int{21, 45}, "Manifestor", "Ego Manifested", "Single Definition"},
		{"ego projector", []int{25, 51}, "Projector", "Ego Projected", "Single Definition"},
		{"self projector", []int{1, 8}, "Projector", "Self Projected", "Single Definition"},
		{"mental projector", []int{64, 47}, "Projector", "Sounding Board", "Single Definition"},
		{"splenic projector", []int{18, 58}, "Projector", "Splenic", "Single Definition"},
		{"emotional wins", []int{3, 60, 12, 22}, "Manifesting Generator", "Emotional - Solar Plexus", "Split Definition"},
		{"disconnected G does not drive throat", []int{25, 51, 17, 62}, "Projector", "Ego Projected", "Split Definition"},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			p := map[string]Activation{}
			for i, g := range c.gates {
				p[string(rune('a'+i))] = Activation{Gate: g, Line: 1}
			}
			r := Result{Personality: p, Design: map[string]Activation{}}
			derive(&r)
			if r.Type != c.kind || r.Authority != c.authority || r.Definition != c.definition {
				t.Fatalf("got %s / %s / %s", r.Type, r.Authority, r.Definition)
			}
		})
	}
}
func TestLocalCitySearch(t *testing.T) {
	p := NewLocal()
	for _, query := range []string{"İstanbul", "istanbul", "ISTANBUL"} {
		r, err := p.Locations(context.Background(), query)
		if err != nil || len(r) == 0 || r[0].Timezone != "Europe/Istanbul" {
			t.Fatalf("search %s failed: %v %v", query, r, err)
		}
	}
	a, _ := p.Locations(context.Background(), "london")
	b, _ := p.Locations(context.Background(), "London")
	if !reflect.DeepEqual(a, b) || len(a) == 0 || a[0].Timezone != "Europe/London" {
		t.Fatal("city ranking invalid")
	}
}
