package app

import (
	"context"
	_ "embed"
	"errors"
	"fmt"
	"math"
	"sort"
	"strings"
	"time"
	"unicode"

	"golang.org/x/text/unicode/norm"
	"starmora/human-design/internal/astronomy"
)

// The traditional tropical mandala: Gate 41 begins at 302° (2° Aquarius).
var gateWheel = [64]int{41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60}
var channelPairs = [36][2]int{{1, 8}, {2, 14}, {3, 60}, {4, 63}, {5, 15}, {6, 59}, {7, 31}, {9, 52}, {10, 20}, {10, 34}, {10, 57}, {11, 56}, {12, 22}, {13, 33}, {16, 48}, {17, 62}, {18, 58}, {19, 49}, {20, 34}, {20, 57}, {21, 45}, {23, 43}, {24, 61}, {25, 51}, {26, 44}, {27, 50}, {28, 38}, {29, 46}, {30, 41}, {32, 54}, {34, 57}, {35, 36}, {37, 40}, {39, 55}, {42, 53}, {47, 64}}
var centerGates = map[string][]int{"head": {64, 61, 63}, "ajna": {47, 24, 4, 17, 11, 43}, "throat": {62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16}, "g": {1, 13, 25, 46, 2, 15, 10, 7}, "heart": {21, 40, 26, 51}, "splenic": {48, 57, 44, 50, 32, 28, 18}, "sacral": {34, 5, 14, 29, 59, 9, 3, 42, 27}, "solar plexus": {6, 37, 30, 55, 49, 22, 36}, "root": {53, 60, 52, 19, 39, 41, 58, 38, 54}}
var allCenters = []string{"head", "ajna", "throat", "g", "heart", "splenic", "sacral", "solar plexus", "root"}

func normalized(deg float64) float64 { return math.Mod(math.Mod(deg, 360)+360, 360) }
func activation(deg float64) Activation {
	pos := normalized(deg-302) / 5.625
	index := int(math.Floor(pos))
	fraction := pos - float64(index)
	return Activation{Gate: gateWheel[index%64], Line: int(math.Floor(fraction*6)) + 1, Longitude: normalized(deg)}
}
func gateCenter(g int) string {
	for c, gs := range centerGates {
		for _, v := range gs {
			if v == g {
				return c
			}
		}
	}
	return ""
}
func derive(r *Result) {
	gates := map[int]bool{}
	for _, layer := range []map[string]Activation{r.Personality, r.Design} {
		for _, a := range layer {
			gates[a.Gate] = true
		}
	}
	r.Gates = []int{}
	for g := range gates {
		r.Gates = append(r.Gates, g)
	}
	sort.Ints(r.Gates)
	graph := map[string][]string{}
	r.Channels = []string{}
	for _, pair := range channelPairs {
		if gates[pair[0]] && gates[pair[1]] {
			a, b := gateCenter(pair[0]), gateCenter(pair[1])
			graph[a] = append(graph[a], b)
			graph[b] = append(graph[b], a)
			r.Channels = append(r.Channels, fmt.Sprintf("%d-%d", pair[0], pair[1]))
		}
	}
	r.Centers = []string{}
	for _, c := range allCenters {
		if len(graph[c]) > 0 {
			r.Centers = append(r.Centers, c)
		}
	}
	reachable := func(start, target string) bool {
		seen := map[string]bool{}
		queue := []string{start}
		for len(queue) > 0 {
			n := queue[0]
			queue = queue[1:]
			if seen[n] {
				continue
			}
			seen[n] = true
			if n == target && len(graph[n]) > 0 {
				return true
			}
			queue = append(queue, graph[n]...)
		}
		return false
	}
	motorThroat := false
	for _, motor := range []string{"sacral", "heart", "solar plexus", "root"} {
		motorThroat = motorThroat || reachable(motor, "throat")
	}
	switch {
	case len(r.Centers) == 0:
		r.Type = "Reflector"
		r.Strategy = "Wait a Lunar Cycle"
	case len(graph["sacral"]) > 0:
		if motorThroat {
			r.Type = "Manifesting Generator"
		} else {
			r.Type = "Generator"
		}
		r.Strategy = "To Respond"
	case motorThroat:
		r.Type = "Manifestor"
		r.Strategy = "To Inform"
	default:
		r.Type = "Projector"
		r.Strategy = "Wait for the Invitation"
	}
	switch {
	case r.Type == "Reflector":
		r.Authority = "Lunar"
	case len(graph["solar plexus"]) > 0:
		r.Authority = "Emotional - Solar Plexus"
	case len(graph["sacral"]) > 0:
		r.Authority = "Sacral"
	case len(graph["splenic"]) > 0:
		r.Authority = "Splenic"
	case len(graph["heart"]) > 0:
		if r.Type == "Manifestor" {
			r.Authority = "Ego Manifested"
		} else {
			r.Authority = "Ego Projected"
		}
	case reachable("g", "throat"):
		r.Authority = "Self Projected"
	default:
		r.Authority = "Sounding Board"
	}
	components := 0
	visited := map[string]bool{}
	for _, center := range r.Centers {
		if visited[center] {
			continue
		}
		components++
		queue := []string{center}
		for len(queue) > 0 {
			n := queue[0]
			queue = queue[1:]
			if visited[n] {
				continue
			}
			visited[n] = true
			queue = append(queue, graph[n]...)
		}
	}
	definitions := []string{"No Definition", "Single Definition", "Split Definition", "Triple Split Definition", "Quadruple Split Definition"}
	if components < len(definitions) {
		r.Definition = definitions[components]
	}
	r.Profile = fmt.Sprintf("%d / %d", r.Personality["Sun"].Line, r.Design["Sun"].Line)
	r.Cross = fmt.Sprintf("%d/%d | %d/%d", r.Personality["Sun"].Gate, r.Personality["Earth"].Gate, r.Design["Sun"].Gate, r.Design["Earth"].Gate)
}

//go:embed cities.tsv
var cityData string

type indexedCity struct {
	location Location
	search   string
	city     string
}
type Local struct{ cities []indexedCity }

func NewLocal() *Local {
	p := &Local{}
	for _, line := range strings.Split(strings.TrimSpace(cityData), "\n") {
		v := strings.Split(line, "\t")
		if len(v) != 3 {
			continue
		}
		if _, err := time.LoadLocation(v[2]); err != nil {
			continue
		}
		label := v[0] + ", " + v[1]
		p.cities = append(p.cities, indexedCity{Location{label, v[2]}, searchText(label), searchText(v[0])})
	}
	return p
}
func searchText(s string) string {
	var out strings.Builder
	for _, c := range norm.NFD.String(strings.ToLower(s)) {
		if unicode.Is(unicode.Mn, c) {
			continue
		}
		if c == 'ı' {
			c = 'i'
		}
		out.WriteRune(c)
	}
	return out.String()
}
func (*Local) Ready() bool  { return true }
func (*Local) Name() string { return "starmora-local-v1" }
func (p *Local) Locations(ctx context.Context, q string) ([]Location, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	q = searchText(strings.TrimSpace(q))
	out := []Location{}
	seen := map[string]bool{}
	// Exact city matches first, then prefixes, then substrings. The source is
	// sorted by population, so a common city outranks an obscure district.
	for pass := 0; pass < 3 && len(out) < 20; pass++ {
		for _, c := range p.cities {
			match := false
			switch pass {
			case 0:
				match = c.city == q
			case 1:
				match = strings.HasPrefix(c.city, q)
			case 2:
				match = strings.Contains(c.search, q)
			}
			key := c.location.Value + c.location.Timezone
			if match && !seen[key] {
				seen[key] = true
				out = append(out, c.location)
				if len(out) == 20 {
					break
				}
			}
		}
	}
	return out, nil
}
func (*Local) Calculate(ctx context.Context, b Birth) (Result, error) {
	if err := ctx.Err(); err != nil {
		return Result{}, err
	}
	birth, err := b.Instant()
	if err != nil {
		return Result{}, err
	}
	design, err := astronomy.DesignTime(birth)
	if err != nil {
		return Result{}, err
	}
	if design.After(birth.Add(-80*24*time.Hour)) || design.Before(birth.Add(-100*24*time.Hour)) {
		return Result{}, errors.New("design instant outside expected range")
	}
	r := Result{Personality: map[string]Activation{}, Design: map[string]Activation{}, Engine: astronomy.Version, BirthUTC: birth.Format(time.RFC3339), DesignUTC: design.Format(time.RFC3339), NodeMethod: "osculating-true", Warnings: []string{}}
	for _, layer := range []struct {
		instant time.Time
		name    string
		dest    map[string]Activation
	}{{birth, "Kişilik", r.Personality}, {design, "Tasarım", r.Design}} {
		if err := ctx.Err(); err != nil {
			return Result{}, err
		}
		longitudes, err := astronomy.Longitudes(layer.instant)
		if err != nil {
			return Result{}, err
		}
		for _, planet := range astronomy.Bodies {
			deg := longitudes[planet]
			layer.dest[planet] = activation(deg)
			position := normalized(deg-302) / 0.9375
			distance := math.Abs(position-math.Round(position)) * 0.9375
			if distance < 0.04 {
				r.Warnings = append(r.Warnings, fmt.Sprintf("%s · %s bir kapı/çizgi sınırına yakın. Kesin doğum saati ve farklı efemeris sonuçları bu aktivasyonu değiştirebilir.", layer.name, planet))
			}
		}
	}
	derive(&r)
	return r, nil
}
