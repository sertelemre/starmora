package app

import (
	"context"
	"encoding/json"
	"fmt"
	"reflect"
	"strings"
	"testing"
)

func TestReadingDictionariesCoverAllMechanics(t *testing.T) {
	if len(gateThemes) != 64 || len(channelThemes) != 36 || len(centerThemes) != 9 || len(lineThemes) != 6 || len(typeThemes) != 5 || len(authorityThemes) != 8 {
		t.Fatal("incomplete editorial dictionary")
	}
	check := func(label string, value theme) {
		t.Helper()
		if value.title == "" || value.body == "" || value.practice == "" || value.question == "" {
			t.Errorf("incomplete content for %s", label)
		}
	}
	for g := 1; g <= 64; g++ {
		check(fmt.Sprint(g), gateThemes[g])
	}
	for _, pair := range channelPairs {
		id := fmt.Sprintf("%d-%d", pair[0], pair[1])
		check(id, channelThemes[id])
	}
	for _, c := range allCenters {
		check(c, centerThemes[c])
	}
	for planet := range planetLabels {
		if planetThemes[planet] == "" {
			t.Errorf("missing planet meaning for %s", planet)
		}
	}
}

func TestReadingUsesChartEvidenceAndEmotionalPriority(t *testing.T) {
	r, err := NewLocal().Calculate(context.Background(), Birth{"2019-05-05", "10:10", "London, GB", "Europe/London"})
	if err != nil {
		t.Fatal(err)
	}
	o := GenerateReading(r)
	if len(o.Sections) != 7 || len(o.Centers) != 9 || len(o.Channels) != len(r.Channels) || len(o.Gates) != len(r.Gates) || len(o.Practice) != 7 {
		t.Fatal("missing chart interpretation")
	}
	if o.Sections[1].ID != "authority" || !strings.Contains(o.Sections[1].Title, "Duygusal") || !strings.Contains(strings.Join(o.Centers[6].Paragraphs, " "), "karar otoriten duygusal") {
		t.Fatal("emotional priority lost behind sacral definition")
	}
	for i, gate := range r.Gates {
		item := o.Gates[i]
		if item.ID != fmt.Sprintf("gate-%d", gate) {
			t.Fatal("gate ordering differs from actual chart")
		}
		// Each activation in both layers must be attributed to its actual gate.
		for _, layer := range []struct {
			label string
			data  map[string]Activation
		}{{"Kişilik", r.Personality}, {"Tasarım", r.Design}} {
			for planet, a := range layer.data {
				if a.Gate == gate {
					want := fmt.Sprintf("%s · %s · %d.%d", layer.label, planetLabels[planet], gate, a.Line)
					if !strings.Contains(strings.Join(item.Evidence, "|"), want) {
						t.Errorf("missing actual activation %s", want)
					}
				}
			}
		}
	}
	if !strings.Contains(strings.Join(o.Sections[5].Paragraphs, " "), "çapraz adı uydurulmaz") {
		t.Fatal("unverified cross naming must not be inferred")
	}
	before, _ := json.Marshal(r)
	first, _ := json.Marshal(o)
	for i := 0; i < 30; i++ {
		next, _ := json.Marshal(GenerateReading(r))
		if string(first) != string(next) {
			t.Fatal("reading varies by map order")
		}
	}
	after, _ := json.Marshal(r)
	if string(before) != string(after) {
		t.Fatal("reading changed saved chart")
	}
}

func TestReadingOpenAndUndefinedCentersAreDistinct(t *testing.T) {
	r := Result{Personality: map[string]Activation{"Sun": {3, 1, 0}, "Earth": {61, 1, 0}}, Design: map[string]Activation{"Sun": {60, 3, 0}}}
	derive(&r)
	o := GenerateReading(r)
	if o.Centers[0].Subtitle != "Tanımsız" || o.Centers[1].Subtitle != "Tamamen açık" || o.Centers[6].Subtitle != "Tanımlı" {
		t.Fatal("open / undefined / defined conflated")
	}
	if len(o.Channels) != 1 || o.Channels[0].ID != "channel-3-60" {
		t.Fatal("unactivated channels included")
	}
	r.Channels = []string{"60-3"}
	if len(GenerateReading(r).Channels) != 1 {
		t.Fatal("reversed provider channel lost")
	}
}

func TestReadingProfilesAndAuthorityCoverage(t *testing.T) {
	for _, profile := range []string{"1 / 3", "1 / 4", "2 / 4", "2 / 5", "3 / 5", "3 / 6", "4 / 6", "4 / 1", "5 / 1", "5 / 2", "6 / 2", "6 / 3"} {
		o := GenerateReading(Result{Profile: profile})
		if len(o.Sections[3].Paragraphs) != 3 {
			t.Errorf("profile %s missing either line", profile)
		}
	}
	for authority, theme := range authorityThemes {
		o := GenerateReading(Result{Authority: authority})
		if o.Sections[1].Title != theme.title || o.Practice[2] != "3. gün · "+theme.practice {
			t.Errorf("authority %s mixed with another rule", authority)
		}
	}
	for kind, theme := range typeThemes {
		if GenerateReading(Result{Type: kind}).Sections[0].Title != theme.title {
			t.Errorf("type %s content mismatch", kind)
		}
	}
	o := GenerateReading(Result{Gates: []int{0, -1, 65, 1, 1}, Profile: "nonsense/4/5", Channels: []string{"0-65"}, Type: "unsupported", Authority: "unsupported"})
	if len(o.Gates) != 1 || len(o.Channels) != 0 || !strings.Contains(o.Sections[1].Paragraphs[0], "öneri üretilmedi") {
		t.Fatal("invalid data produced unsupported claims")
	}
	if !reflect.DeepEqual(o, GenerateReading(Result{Gates: []int{1}, Profile: "nonsense/4/5", Type: "unsupported", Authority: "unsupported"})) {
		t.Fatal("invalid gates or channels polluted content")
	}
}
