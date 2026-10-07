# Astronomy Engine

Unmodified `astronomy.c` and `astronomy.h`, release **v2.1.19**, by Don Cross.

Source: https://github.com/cosinekitty/astronomy/tree/v2.1.19/source/c

License: MIT; the complete notice is included in `LICENSE` and source headers.

Our Go/C wrapper is `engine.go`. It serializes calls to protect the upstream mutable Pluto cache. It computes tropical, geocentric ecliptic longitudes of date, with light-time/aberration for planets. Lunar nodes are osculating nodes derived from the lunar state vector. UTC/UT1 and delta-T use the upstream model.

Upstream targets approximately one arcminute accuracy, not exact Swiss Ephemeris equivalence. Charts near a gate or line boundary require care; Starmora records boundary warnings and engine metadata. No official Jovian/IHDS endorsement is claimed.
