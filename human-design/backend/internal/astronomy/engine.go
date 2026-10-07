// Package astronomy wraps the unmodified MIT-licensed Astronomy Engine 2.1.19.
// The C engine has a mutable Pluto cache, so every call is serialized here.
package astronomy

/*
#cgo CFLAGS: -O2
#cgo LDFLAGS: -lm
#include "astronomy.h"
#include <math.h>

static int positions(double ut, double *out) {
 astro_time_t t=Astronomy_TimeFromDays(ut);
 astro_ecliptic_t sun=Astronomy_SunPosition(t);
 if(sun.status!=ASTRO_SUCCESS)return sun.status;
 out[0]=sun.elon;out[1]=fmod(sun.elon+180.0,360.0);
 astro_state_vector_t moon=Astronomy_GeoMoonState(t);
 astro_rotation_t rotation=Astronomy_Rotation_EQJ_ECT(&t);
 moon=Astronomy_RotateState(rotation,moon);
 if(moon.status!=ASTRO_SUCCESS)return moon.status;
 double hx=moon.y*moon.vz-moon.z*moon.vy;
 double hy=moon.z*moon.vx-moon.x*moon.vz;
 out[2]=fmod(atan2(hx,-hy)*180.0/3.141592653589793+360.0,360.0);
 out[3]=fmod(out[2]+180.0,360.0);
 astro_spherical_t lunar=Astronomy_EclipticGeoMoon(t);
 if(lunar.status!=ASTRO_SUCCESS)return lunar.status;
 out[4]=lunar.lon;
 astro_body_t bodies[]={BODY_MERCURY,BODY_VENUS,BODY_MARS,BODY_JUPITER,BODY_SATURN,BODY_URANUS,BODY_NEPTUNE,BODY_PLUTO};
 for(int i=0;i<8;i++){
  astro_vector_t vector=Astronomy_GeoVector(bodies[i],t,ABERRATION);
  if(vector.status!=ASTRO_SUCCESS)return vector.status;
  astro_ecliptic_t ecliptic=Astronomy_Ecliptic(vector);
  if(ecliptic.status!=ASTRO_SUCCESS)return ecliptic.status;
  out[5+i]=ecliptic.elon;
 }
 return 0;
}
static int design_time(double ut,double *out) {
 astro_time_t birth=Astronomy_TimeFromDays(ut);
 astro_ecliptic_t sun=Astronomy_SunPosition(birth);
 if(sun.status!=ASTRO_SUCCESS)return sun.status;
 double target=fmod(sun.elon-88.0+360.0,360.0);
 astro_search_result_t r=Astronomy_SearchSunLongitude(target,Astronomy_AddDays(birth,-100),20);
 if(r.status!=ASTRO_SUCCESS)return r.status;
 *out=r.time.ut;return 0;
}
*/
import "C"

import (
	"errors"
	"math"
	"sync"
	"time"
)

const Version = "astronomy-engine-2.1.19/starmora-1"

var lock sync.Mutex
var Bodies = []string{"Sun", "Earth", "North Node", "South Node", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"}

func days(t time.Time) float64 {
	return (float64(t.Unix()) - 946728000 + float64(t.Nanosecond())/1e9) / 86400
}
func Longitudes(t time.Time) (map[string]float64, error) {
	lock.Lock()
	defer lock.Unlock()
	var out [13]C.double
	if C.positions(C.double(days(t)), &out[0]) != 0 {
		return nil, errors.New("astronomy position calculation failed")
	}
	result := map[string]float64{}
	for i, b := range Bodies {
		v := float64(out[i])
		if math.IsNaN(v) || math.IsInf(v, 0) {
			return nil, errors.New("non-finite astronomy position")
		}
		result[b] = v
	}
	return result, nil
}
func DesignTime(birth time.Time) (time.Time, error) {
	lock.Lock()
	defer lock.Unlock()
	var out C.double
	if C.design_time(C.double(days(birth)), &out) != 0 {
		return time.Time{}, errors.New("design time calculation failed")
	}
	seconds := float64(out)*86400 + 946728000
	whole, fraction := math.Modf(seconds)
	return time.Unix(int64(whole), int64(math.Round(fraction*1e9))).UTC(), nil
}
