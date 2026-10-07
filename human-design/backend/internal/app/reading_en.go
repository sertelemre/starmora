package app

import (
	"fmt"
	"sort"
	"strconv"
	"strings"
)

var englishTypeThemes = map[string]theme{
	"Generator":             {"Generator · sustained participation", "Human Design reads a defined Sacral center through the theme of recurring work and participation. This does not mean unlimited energy for every activity. Observing your response to a concrete task, question or opportunity can help you consider which activities you want to join.", "At the end of a day, note which activities were satisfying and which felt like an obligation. Consider workload and rest rather than treating fatigue as personal failure.", "Am I interested in this activity, or continuing only because I started?"},
	"Manifesting Generator": {"Manifesting Generator · trying and adjusting", "A defined Sacral center and a motor-to-Throat connection form this type. The system describes responding to an activity and adjusting direction while applying it. Use the theme to reflect on multiple interests, revisiting a step or leaving a task; your chart does not require speed or multitasking.", "Try a small practical step in a project, gather feedback and adjust the next step. Tell affected people when your change of direction alters their plans.", "Am I skipping a necessary step, and who needs to hear about a change of direction?"},
	"Projector":             {"Projector · noticing and guiding", "An undefined Sacral center and no motor-to-Throat connection distinguish this type. Human Design describes observing people and processes and having a contribution recognized. Consider where guidance is wanted rather than measuring your value only through continuous production.", "Ask whether feedback is wanted before offering it. Make room for recovery as well as work in your schedule.", "Is my contribution wanted here, and is it recognized mutually?"},
	"Manifestor":            {"Manifestor · initiating and informing", "A motor-to-Throat connection without a defined Sacral center forms this type. The system reads it through initiation and the effect an action has on other people. Your need for space and other people's need for information can both be considered.", "Before a change, tell affected people its scope, timing and the space you need. Consider the work of initiating separately from the work of maintaining it.", "Who will this beginning affect, and what can I tell them beforehand?"},
	"Reflector":             {"Reflector · observing environment and time", "No center in your chart is defined by a complete channel. This does not mean you have no active gates or no identity. Human Design describes sensitivity to context and gathering perspectives over time. Observing how the same setting affects you on different days can be a useful starting point.", "Keep brief notes across different days in familiar settings. Avoid treating one day's impression as a definition of your whole life.", "Do I have room for myself in this environment, and how does the experience change over time?"},
}
var englishAuthorityThemes = map[string]theme{
	"Emotional - Solar Plexus": {"Emotional authority · clarity over time", "Your Solar Plexus is defined. In the Human Design hierarchy, this takes precedence over Sacral and Splenic signals. Rather than treating first excitement, reluctance or a strong physical response as a final decision, compare an important option across emotional states. The system describes growing clarity rather than absolute certainty.", "Ask for time when an important decision is not urgent. Revisit the option at different times and write down the reasons and wishes that remain. One night or a fixed number of hours is not a universal requirement.", "When my emotional state changes, does my wish for this option change completely too?"},
	"Sacral":                   {"Sacral authority · responding to a concrete option", "This authority applies when the Sacral is defined and the Solar Plexus is undefined. The system emphasizes observing a physical response to a concrete option rather than an abstract life plan. Notice willingness, reluctance or uncertainty; a physical sensation does not replace facts and consequences.", "Break a topic into clear yes-or-no questions. Make a question more concrete where needed, and consider social pressure and actual capacity separately.", "Do I want to participate in this option, or am I trying to persuade myself?"},
	"Splenic":                  {"Splenic authority · immediate awareness", "A defined Spleen without Emotional or Sacral authority forms this reading. Human Design describes a brief, quiet awareness of the present situation. Observe the difference between a first impression and recurring worry; the chart is not a danger detector or health assessment.", "Note an initial impression, then compare it with concrete information. Consider whether what you call intuition might be habit or pressure.", "What was the first quiet impression, and what thoughts were added afterward?"},
	"Ego Manifested":           {"Ego authority · desire and commitment", "In this configuration the Will center connects to the Throat. The reading focuses on expressing a genuine wish and recognizing the effort you can allocate to it. Wanting something and being able to sustain it are different considerations.", "Before promising something, say what you want and what time and resources you can provide. Inform people affected by the decision.", "Do I actually want this, and what resources support my promise?"},
	"Ego Projected":            {"Ego authority · desire within an invitation", "This authority is considered alongside the Projector strategy. Having your contribution recognized does not mean every invitation must be accepted. Distinguish your actual wish from the effort to meet someone else's expectations.", "Clarify what an invitation asks of you. Explain what you want and what you can offer in separate statements.", "Does this invitation include my own wish, or only someone else's expectation?"},
	"Self Projected":           {"Self-projected authority · hearing your direction", "The G center connects to the Throat while no higher-priority inner authority is present. Human Design emphasizes hearing a sense of direction as you express yourself. A listener can provide space for this rather than making the decision on your behalf.", "Talk through options with someone you trust and ask them to listen before offering solutions. Note where your own expression feels more natural.", "Can I hear my own direction while describing this option?"},
	"Sounding Board":           {"Environmental assessment · a space to speak", "This Projector configuration does not define a bodily inner authority. The system describes hearing your own assessment through conversations in suitable environments. Observe how the setting and listener affect your thinking rather than treating their advice as your decision.", "Discuss an important invitation in calm settings with people who can listen without directing you. Separate their advice from statements that express your own assessment.", "Can I think comfortably here, and is my own view clearer after speaking?"},
	"Lunar":                    {"Lunar cycle · gathering perspectives over time", "For Reflectors, the system describes observing a major, non-urgent option across roughly one lunar cycle, about 28–29 days. The theme is to avoid using one day's influence as the measure of a lasting choice. Everyday small tasks do not require this waiting period.", "For a major non-urgent option, record impressions on different days, talk them through and revisit the notes. Include actual deadlines and conditions in your assessment.", "How does this option appear on different days and in different environments?"},
}
var englishLineThemes = map[int]theme{
	1: {"Investigation and foundations", "Learning the basis of a subject. Research can provide confidence, while trying to remove every uncertainty can postpone a beginning.", "Identify the three pieces of information you actually need.", "Is information missing, or am I searching for certainty?"},
	2: {"Natural ability and personal space", "Considering abilities that come naturally alongside a need for solitude. Avoid undervaluing an easy skill or feeling obliged to respond to every call.", "Make separate space for working alone and sharing with suitable people.", "Which ability feels easy to me but valuable to others?"},
	3: {"Experience and experimentation", "Learning what works through trying it. An unexpected result provides information about a process rather than defining your identity.", "Try a small reversible experiment and record what it taught you.", "What did I learn, and what would I change next time?"},
	4: {"Trust and connections", "Sharing through familiar relationships and mutual trust. Consider closeness and boundaries without reducing relationships to collecting opportunities.", "Clarify mutual contribution and expectations and allow time to rest.", "Does this relationship make room for both people?"},
	5: {"Practical solutions and expectations", "Meeting expectations that you can provide a solution. Explain what you can actually offer before taking responsibility for someone else's expectations.", "Discuss scope, success criteria and limits at the start of a task.", "Does what is expected match what I can offer?"},
	6: {"Observation and example", "Stepping back from experience to develop a wider perspective and reflect what has been learned. The system discusses life stages; no character or achievement level is inferred from age here.", "Observe recurring patterns over time before generalizing from an experience.", "What do my actions demonstrate in areas where I give advice?"},
}
var englishCenterThemes = map[string]theme{
	"head":         {"Head · questions and inspiration", "Questions, curiosity and the pressure to find answers.", "Write down questions and choose which ones relate to something you actually need to address today.", "Does every question need an answer now?"},
	"ajna":         {"Ajna · making sense of information", "Concepts, perspectives and the way information is interpreted.", "Separate facts, interpretations and assumptions; allow room for changing your view.", "Do I know this, or am I working with an interpretation?"},
	"throat":       {"Throat · expression and visible action", "Expressing, explaining and making something visible.", "Observe the timing and the listener's interest as well as the content of your words.", "Is there room for this expression now?"},
	"g":            {"G · direction and identity", "Direction, belonging and the way you describe yourself.", "Note which aspects of yourself have room in a setting and which roles feel restrictive.", "Can I express myself comfortably in this environment?"},
	"heart":        {"Will · value and commitment", "Desire, self-worth, promises and allocating resources.", "Match promises with actual time and resources; reconsider commitments made only to prove your value.", "Does this commitment come from desire or a need to prove myself?"},
	"splenic":      {"Spleen · immediate awareness", "Immediate impressions, habits and holding on; this is not information about an organ's health.", "Consider whether a familiar habit still serves its purpose today.", "Am I keeping this because it is familiar or because it is useful?"},
	"sacral":       {"Sacral · participation and work", "Willingness to participate, a working rhythm and sustainable engagement.", "Include capacity and recovery time in your plans.", "What is my actual capacity for this activity?"},
	"solar plexus": {"Solar Plexus · emotional experience", "Feelings, relational sensitivity and experience changing over time.", "Record the situation and time alongside a feeling; avoid defining an entire relationship through one emotional state.", "Which need can I recognize within this feeling?"},
	"root":         {"Root · pressure and pace", "Beginning, finishing and acting under pressure.", "Separate an actual deadline from the feeling that you must hurry.", "Do I need to move faster, or just want to escape the pressure?"},
}
var englishPlanetThemes = map[string]string{"Sun": "your central themes of expression", "Earth": "balance and grounding", "North Node": "direction and environmental experience", "South Node": "familiar environmental experience", "Moon": "the impulse to move", "Mercury": "communication", "Venus": "values and boundaries", "Mars": "learning through experience", "Jupiter": "principles and expansion", "Saturn": "responsibility and limits", "Uranus": "individuality and change", "Neptune": "uncertainty and the search for meaning", "Pluto": "deep inquiry"}

// Use the Turkish generator's normalized mechanics and stable IDs. Localization
// changes only editorial content, never the chart or its astronomical data.
func GenerateReadingLanguage(r Result, language string) Reading {
	o := GenerateReading(r)
	if language != "en" {
		return o
	}
	o.Version = "starmora-en-1"
	o.Introduction = "This reading explains the calculated elements of your chart within the Human Design tradition as a guide to self-observation. Human Design is not a scientifically validated personality test. The text does not establish your personality, future, health or destiny. Explore examples that fit your experience and leave those that do not."
	t, ok := englishTypeThemes[r.Type]
	if !ok {
		t = theme{"Type information", "This chart's type label is not supported by the reading catalog. No additional inference was made.", "", ""}
	}
	a, ok := englishAuthorityThemes[r.Authority]
	if !ok {
		a = theme{"Authority information", "This chart's authority label is not supported. No automatic decision guidance was generated.", "", ""}
	}
	o.Sections[0] = section("type", t, "Calculated type: "+r.Type, "Strategy: "+r.Strategy)
	o.Sections[1] = section("authority", a, "Calculated authority: "+r.Authority)
	st := map[string]theme{
		"To Respond":              {"Strategy · responding to something concrete", "Observe your response to a question, event, option or encounter rather than constructing an abstract obligation. This does not require passivity: exploring, asking questions and creating options can also provide concrete encounters.", "Turn a general goal into a concrete option and consider it alongside your authority section.", "Which concrete option is available to consider?"},
		"Wait for the Invitation": {"Strategy · recognition and invitation", "For important areas such as partnership, close relationships or guidance, the system describes considering an invitation in which your contribution is recognized. It does not mean waiting for permission for every everyday action. An invitation is not a guarantee of suitability; consider the role, exchange and your authority together.", "Discuss the role, decision space, expectations and exchange involved in an invitation.", "Which contribution am I actually being invited to make?"},
		"To Inform":               {"Strategy · informing affected people", "Explain beforehand how a beginning will affect other people. Informing is a communication behavior rather than asking for approval at every step; shared responsibilities still require mutual agreement.", "Identify who needs to hear about a change and consult the authority section for how to consider it.", "Which information would make this transition clearer for others?"},
		"Wait a Lunar Cycle":      {"Strategy · allowing time for major choices", "Consider important, non-urgent options through experiences on different days. Observe the pattern over time rather than measuring an entire decision through one setting or day.", "Record the date and setting alongside your observations.", "Can I distinguish a recurring impression from a temporary influence?"},
	}[r.Strategy]
	if st.title == "" {
		st = theme{"Strategy information", "No supported reading is available for this strategy.", "", ""}
	}
	o.Sections[2] = section("strategy", st, "Calculated strategy: "+r.Strategy)
	o.Sections[2].Paragraphs = append(o.Sections[2].Paragraphs, "Strategy describes how to approach an opportunity; authority describes how to consider it. For this chart, the decision approach is: "+a.title+". Read the examples for your type alongside that authority.")
	p := ReadingSection{ID: "profile", Title: "Profile · " + r.Profile, Evidence: []string{"Personality Sun line + Design Sun line"}, Paragraphs: []string{"The first number is the Personality Sun line and the second is the Design Sun line. The system reads them together as a role you may recognize more readily and a behavioral theme that other people may also notice. The numbers are not a ranking of success or development."}, Practice: "Choose an event in which you recognize both themes. What did you notice yourself, and what did someone else point out?", Question: "How do I balance these two roles?"}
	parts := strings.Split(strings.ReplaceAll(r.Profile, " ", ""), "/")
	for i, value := range parts {
		if i > 1 {
			break
		}
		line, err := strconv.Atoi(value)
		if lt, exists := englishLineThemes[line]; exists && err == nil {
			p.Paragraphs = append(p.Paragraphs, fmt.Sprintf("%s · line %d — %s: %s %s", []string{"Personality", "Design"}[i], line, lt.title, lt.body, lt.practice))
		}
	}
	o.Sections[3] = p
	definition := map[string]string{
		"No Definition":              "No center is defined by a complete channel, although active gates may still be present. The system considers this through comparing experiences in different settings. It does not indicate a lack of identity or wholeness.",
		"Single Definition":          "Your defined centers form one connected group. The system reads their themes as linked within one network. This does not mean having to live alone, handle every task independently or never need support.",
		"Split Definition":           "Your defined centers form two separate connected groups. Observe the themes of the two groups separately. Different connections can be experienced with others, but no person is required to complete you.",
		"Triple Split Definition":    "Your defined centers form three separate connected groups. The system considers changing experiences across settings and interactions. Explore the contribution of different contexts rather than expecting one person to meet every need.",
		"Quadruple Split Definition": "Your defined centers form four separate connected groups. The system treats their themes and connection experiences as areas to observe, rather than an obstacle or defect. Your decision approach remains the one described under authority.",
	}[r.Definition]
	if definition == "" {
		definition = "The definition label is not supported; no additional conclusion about its connections was made."
	}
	definedCount := 0
	activeGates := map[int]bool{}
	for _, g := range o.Gates {
		number, _ := strconv.Atoi(strings.TrimPrefix(g.ID, "gate-"))
		activeGates[number] = true
	}
	for i, c := range o.Centers {
		id := allCenters[i]
		ct := englishCenterThemes[id]
		status, explanation := "Undefined", "This center contains an active gate but has no complete channel defining it. The system describes experience here as potentially changing with context and relationships. Variability is not a deficiency; compare different situations as an observation exercise."
		if c.Subtitle == "Tanımlı" {
			status = "Defined"
			definedCount++
			explanation = "At least one complete channel defines this center. Human Design interprets this as a more consistent expression of the themes here. Consistency does not require identical behavior in every situation, superiority or treating this center alone as your decision authority."
		} else if c.Subtitle == "Tamamen açık" {
			status = "Completely open"
			explanation = "This center is undefined and has no active gates. The system describes observing different experiences without a fixed gate theme here. Openness does not imply a lack of ability or a problem."
		}
		active := []int{}
		for _, g := range centerGates[id] {
			if activeGates[g] {
				active = append(active, g)
			}
		}
		sort.Ints(active)
		cs := section(c.ID, ct, "Status: "+status, fmt.Sprintf("Active gates: %v", active))
		cs.Subtitle = status
		cs.Paragraphs = append(cs.Paragraphs, explanation)
		if id == "solar plexus" && status == "Defined" {
			cs.Paragraphs = append(cs.Paragraphs, "This center also determines Emotional authority in this chart. For important decisions, use the approach to clarity over time described in that section.")
		}
		if id == "sacral" && status == "Defined" && r.Authority == "Emotional - Solar Plexus" {
			cs.Paragraphs = append(cs.Paragraphs, "Although your Sacral is defined, your decision authority in this chart is Emotional. An initial physical response is not interpreted as the final answer to an important decision on its own.")
		}
		o.Centers[i] = cs
	}
	o.Sections[4] = section("definition", theme{"Definition · how the centers connect", definition, "Compare considering a topic alone and discussing it. Note what changes without describing the difference as a deficiency.", "How do I bring the different parts of an idea together?"}, "Calculated definition: "+r.Definition, fmt.Sprintf("Defined centers: %d · complete channels: %d", definedCount, len(o.Channels)))
	for i, c := range o.Channels {
		id := strings.TrimPrefix(c.ID, "channel-")
		ct := englishChannelThemes[id]
		pair := strings.Split(id, "-")
		first, _ := strconv.Atoi(pair[0])
		second, _ := strconv.Atoi(pair[1])
		cs := section(c.ID, ct, "Defined channel: "+id, englishCenterThemes[gateCenter(first)].title+" ↔ "+englishCenterThemes[gateCenter(second)].title)
		cs.Title = id + " · " + ct.title
		cs.Paragraphs = append(cs.Paragraphs, "Both gates are active, forming a complete connection. A channel may be formed across Personality and Design and is not reduced to one planetary placement. Its theme does not replace the decision approach described by your type and authority.")
		o.Channels[i] = cs
	}
	for i, g := range o.Gates {
		number, _ := strconv.Atoi(strings.TrimPrefix(g.ID, "gate-"))
		gt := englishGateThemes[number]
		gs := section(g.ID, gt, "Center: "+englishCenterThemes[gateCenter(number)].title)
		gs.Title = fmt.Sprintf("%d · %s", number, gt.title)
		for _, layer := range []struct {
			label string
			data  map[string]Activation
		}{{"Personality", r.Personality}, {"Design", r.Design}} {
			for _, planet := range readingPlanets {
				act, exists := layer.data[planet]
				if !exists || act.Gate != number {
					continue
				}
				gs.Evidence = append(gs.Evidence, fmt.Sprintf("%s · %s · %d.%d", layer.label, planet, number, act.Line))
				if lt, exists := englishLineThemes[act.Line]; exists {
					gs.Paragraphs = append(gs.Paragraphs, fmt.Sprintf("%s %s, line %d: %s. Observe this gate's theme in the context of %s.", layer.label, planet, act.Line, lt.title, englishPlanetThemes[planet]))
				}
			}
		}
		connected, partners := []string{}, []string{}
		for _, pair := range channelPairs {
			if pair[0] != number && pair[1] != number {
				continue
			}
			partner := pair[0]
			if partner == number {
				partner = pair[1]
			}
			if containsChannel(r.Channels, pair) {
				connected = append(connected, fmt.Sprintf("%d-%d", pair[0], pair[1]))
			} else {
				partners = append(partners, strconv.Itoa(partner))
			}
		}
		if len(connected) > 0 {
			gs.Paragraphs = append(gs.Paragraphs, "Complete channels in your chart: "+strings.Join(connected, ", ")+".")
		}
		if len(partners) > 0 {
			gs.Paragraphs = append(gs.Paragraphs, "The connection to gate(s) "+strings.Join(partners, ", ")+" does not form a complete channel in your chart. One active gate does not define a center by itself. This does not imply that you need a person to complete the connection or must enter a relationship.")
		}
		o.Gates[i] = gs
	}
	cross := ReadingSection{ID: "cross", Title: "Sun–Earth axis · life themes", Evidence: []string{}, Paragraphs: []string{"Human Design reads the incarnation cross through the Personality and Design Sun–Earth gates. Here the four symbolic themes are presented together. They are not a definitive life purpose, a career recommendation or a prediction. No verified catalog of named crosses is used, so a cross name is not invented from gate numbers."}, Practice: "Choose a theme among these four that has a concrete example in your life. Do not force an example for a theme you do not recognize.", Question: "Where do these themes meet my experience, and where do they not?"}
	for _, layer := range []struct {
		label string
		data  map[string]Activation
	}{{"Personality", r.Personality}, {"Design", r.Design}} {
		for _, planet := range []string{"Sun", "Earth"} {
			act, exists := layer.data[planet]
			if !exists || act.Gate < 1 || act.Gate > 64 {
				continue
			}
			gt := englishGateThemes[act.Gate]
			cross.Evidence = append(cross.Evidence, fmt.Sprintf("%s %s: %d.%d", layer.label, planet, act.Gate, act.Line))
			cross.Paragraphs = append(cross.Paragraphs, fmt.Sprintf("%s %s · %d — %s: %s", layer.label, planet, act.Gate, gt.title, gt.body))
		}
	}
	o.Sections[5] = cross
	o.Sections[6] = section("relationships", theme{"Relationships · expectations, space and communication", "This is a chart for one person; compatibility between two people or the future of a relationship has not been calculated. Use the profile's sharing themes, variable experiences in undefined centers and your authority's decision approach to discuss boundaries. Similar or different types do not by themselves establish a good or bad match.", "Turn an expectation into a clear statement: what is expected, what can I offer and how much time do I need? Leave room for the other person's assessment as well.", "Can I express my decisions and needs in this relationship?"}, "One-person chart · no relationship comparison calculated")
	o.Practice = []string{"Day 1 · Choose a real event: a task, offer or conversation. Write what happened without interpretation.", "Day 2 · Read your type and strategy sections. Observe how you began and what response you received.", "Day 3 · " + a.practice, "Day 4 · Consider your two profile lines. Separate themes you noticed yourself from those pointed out by others.", "Day 5 · Choose a defined and an undefined or open center. Compare the theme in two settings. If all centers are defined, compare different centers.", "Day 6 · Connect a channel or gate theme with a concrete experience. Record examples that do not fit as well.", "Day 7 · Revisit your notes. Choose one small change that is useful; do not turn the rest into compulsory rules."}
	if a.practice == "" {
		o.Practice[2] = "Day 3 · Authority data is unsupported; no automatic decision guidance was generated."
	}
	o.Summary = fmt.Sprintf("Your chart was calculated as %s with %s authority and profile %s. It contains %d defined centers, %d defined channels and %d distinct active gates. The sections below use these concrete chart elements.", r.Type, r.Authority, r.Profile, definedCount, len(o.Channels), len(o.Gates))
	for i, title := range []string{"Type and strategy · Jovian Archive", "Inner authority · Jovian Archive", "Profile · Jovian Archive", "Centers · Human.Design", "Channels · Human.Design"} {
		o.Sources[i].Title = title
	}
	return o
}
