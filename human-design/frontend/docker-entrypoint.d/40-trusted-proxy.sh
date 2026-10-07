#!/bin/sh
set -eu

upstream=${API_UPSTREAM_HOST:-backend}
case "$upstream" in
  ''|*[!a-zA-Z0-9.-]*|.*|-*|*.)
    echo "API_UPSTREAM_HOST must be a Docker DNS hostname." >&2
    exit 1
    ;;
esac
if [ "${#upstream}" -gt 253 ]; then
  echo "API_UPSTREAM_HOST is too long." >&2
  exit 1
fi
printf 'set $api_upstream http://%s:8080;\n' "$upstream" > /etc/nginx/starmora-upstream.conf

config=/etc/nginx/conf.d/40-trusted-proxy.conf
cidr=${TRUSTED_PROXY_CIDR:-}
if [ -z "$cidr" ]; then
  rm -f "$config"
  exit 0
fi

# One explicit IPv4 CIDR only; prevent config injection and trusting all IPs.
if ! printf '%s\n' "$cidr" | awk -F '[./]' '
  NR != 1 || NF != 5 { bad = 1 }
  {
    for (i = 1; i <= 4; i++) {
      if ($i !~ /^[0-9]+$/ || length($i) > 3 || $i > 255) bad = 1
    }
    if ($5 !~ /^[0-9]+$/ || $5 < 8 || $5 > 32) bad = 1
  }
  END { exit bad }
'; then
  echo "TRUSTED_PROXY_CIDR must be the proxy network IPv4 CIDR with a prefix from /8 to /32." >&2
  exit 1
fi

printf 'set_real_ip_from %s;\nreal_ip_header X-Forwarded-For;\nreal_ip_recursive on;\n' "$cidr" > "$config"
