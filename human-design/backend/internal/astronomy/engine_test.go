package astronomy

import (
	"encoding/json"
	"math"
	"os"
	"sync"
	"testing"
	"time"
)

func delta(a, b float64) float64 { d := math.Mod(a-b+540, 360) - 180; return math.Abs(d) }
func TestIndependentSwissPositions(t *testing.T) {
	data, err := os.ReadFile("testdata/swiss-moshier.json")
	if err != nil {
		t.Fatal(err)
	}
	var fixture struct {
		Samples []struct {
			UTC             string             `json:"utc"`
			Longitude       map[string]float64 `json:"longitude"`
			DesignUTC       string             `json:"designUtc"`
			DesignLongitude map[string]float64 `json:"designLongitude"`
		} `json:"samples"`
	}
	if err = json.Unmarshal(data, &fixture); err != nil {
		t.Fatal(err)
	}
	maxima := map[string]float64{}
	maxDesignDifference := 0.0
	maxDesignSeconds := 0.0
	for _, sample := range fixture.Samples {
		instant, err := time.Parse(time.RFC3339, sample.UTC)
		if err != nil {
			t.Fatal(err)
		}
		actual, err := Longitudes(instant)
		if err != nil {
			t.Fatal(err)
		}
		for body, expected := range sample.Longitude {
			diff := delta(actual[body], expected)
			if diff > maxima[body] {
				maxima[body] = diff
			}
			if diff > 0.04 {
				t.Errorf("%s %s difference %.6f°; got %.6f expected %.6f", sample.UTC, body, diff, actual[body], expected)
			}
		}
		design, err := DesignTime(instant)
		if err != nil {
			t.Fatal(err)
		}
		expectedDesign, err := time.Parse(time.RFC3339Nano, sample.DesignUTC)
		if err != nil {
			t.Fatal(err)
		}
		if math.Abs(design.Sub(expectedDesign).Seconds()) > 120 {
			t.Errorf("%s design time differs by %.3f seconds", sample.UTC, design.Sub(expectedDesign).Seconds())
		}
		maxDesignSeconds = math.Max(maxDesignSeconds, math.Abs(design.Sub(expectedDesign).Seconds()))
		actualDesign, err := Longitudes(design)
		if err != nil {
			t.Fatal(err)
		}
		for body, expected := range sample.DesignLongitude {
			diff := delta(actualDesign[body], expected)
			maxDesignDifference = math.Max(maxDesignDifference, diff)
			if diff > 0.04 {
				t.Errorf("%s design %s difference %.6f°", sample.UTC, body, diff)
			}
		}
	}
	t.Logf("100 birth + 100 design samples / 2600 positions: birth maximum differences in degrees: %v", maxima)
	t.Logf("design maximum difference %.8f°, solar design instant maximum difference %.4f seconds", maxDesignDifference, maxDesignSeconds)
}
func TestDesignSolarArc(t *testing.T) {
	for _, utc := range []string{"1900-01-01T00:00:00Z", "1992-12-08T23:35:00Z", "2019-05-05T09:10:00Z", "2024-01-01T00:00:00Z"} {
		birth, _ := time.Parse(time.RFC3339, utc)
		design, err := DesignTime(birth)
		if err != nil {
			t.Fatal(err)
		}
		p, _ := Longitudes(birth)
		d, _ := Longitudes(design)
		arc := math.Mod(p["Sun"]-d["Sun"]+360, 360)
		if math.Abs(arc-88) > 0.00001 {
			t.Fatalf("solar arc %.9f", arc)
		}
		days := birth.Sub(design).Hours() / 24
		if days < 85 || days > 94 {
			t.Fatalf("invalid design interval %.4f", days)
		}
	}
}
func TestConcurrentDeterministicEphemeris(t *testing.T) {
	instant := time.Date(1990, 1, 1, 12, 0, 0, 0, time.UTC)
	expected, err := Longitudes(instant)
	if err != nil {
		t.Fatal(err)
	}
	var wg sync.WaitGroup
	for i := 0; i < 30; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			r, e := Longitudes(instant)
			if e != nil {
				t.Error(e)
				return
			}
			for body, v := range expected {
				if r[body] != v {
					t.Errorf("nondeterministic %s", body)
				}
			}
		}()
	}
	wg.Wait()
}
