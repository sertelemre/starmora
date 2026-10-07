package app

import (
	_ "embed"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
)

//go:embed errors.en.json
var englishErrorsJSON []byte
var englishErrors = func() map[string]string {
	var messages map[string]string
	if err := json.Unmarshal(englishErrorsJSON, &messages); err != nil {
		panic(err)
	}
	return messages
}()

type languageWriter struct {
	http.ResponseWriter
	language string
}

func responseLanguage(w http.ResponseWriter) string {
	if localized, ok := w.(*languageWriter); ok {
		return localized.language
	}
	return "tr"
}
func requestLanguage(r *http.Request) string {
	if explicit := r.URL.Query().Get("lang"); explicit != "" {
		return explicit
	}
	best, quality := "tr", 0.0
	for _, part := range strings.Split(r.Header.Get("Accept-Language"), ",") {
		fields := strings.Split(part, ";")
		language := strings.ToLower(strings.TrimSpace(fields[0]))
		weight := 1.0
		for _, field := range fields[1:] {
			if parameter, ok := strings.CutPrefix(strings.TrimSpace(field), "q="); ok {
				parsed, err := strconv.ParseFloat(parameter, 64)
				if err != nil || parsed < 0 || parsed > 1 {
					weight = 0
				} else {
					weight = parsed
				}
			}
		}
		base := strings.SplitN(language, "-", 2)[0]
		if (base == "en" || base == "tr") && weight > quality {
			best, quality = base, weight
		}
	}
	return best
}
func localizeResult(r Result, language string) Result {
	if language != "en" {
		return r
	}
	warnings := make([]string, 0, len(r.Warnings))
	for _, warning := range r.Warnings {
		parts := strings.SplitN(warning, " bir kapı/çizgi sınırına yakın.", 2)
		if len(parts) == 2 {
			label := strings.ReplaceAll(strings.ReplaceAll(parts[0], "Kişilik", "Personality"), "Tasarım", "Design")
			warnings = append(warnings, label+" is close to a gate/line boundary. Birth-time precision and differences between ephemerides may change this activation.")
		} else {
			warnings = append(warnings, "Check birth-time precision and the ephemeris method for this activation.")
		}
	}
	r.Warnings = warnings
	return r
}
