#!/usr/bin/env zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATA_FILE="$ROOT_DIR/data/companies.json"
TMP_FILE="$(mktemp)"
HEADER_FILE="$(mktemp)"
OUTPUT_FILE="$(mktemp)"
ERROR_FILE="$(mktemp)"

cleanup() {
  rm -f "$TMP_FILE"
  rm -f "$HEADER_FILE"
  rm -f "$OUTPUT_FILE"
  rm -f "$ERROR_FILE"
}
trap cleanup EXIT

LIMIT=""
if [[ "${1:-}" == --limit=* ]]; then
  LIMIT="${1#--limit=}"
fi

checked_count=0

while IFS=$'\t' read -r id name url; do
  if [[ -n "$LIMIT" && "$checked_count" -ge "$LIMIT" ]]; then
    break
  fi

  checked_count=$((checked_count + 1))

  : >"$HEADER_FILE"
  : >"$OUTPUT_FILE"
  : >"$ERROR_FILE"

  if zsh -lc "curl -I -L -sS --max-time 20 -o /dev/null -D '$HEADER_FILE' -w '\nCURL_EFFECTIVE_URL:%{url_effective}\n' '$url'" >"$OUTPUT_FILE" 2>"$ERROR_FILE"; then
    output="$(cat "$HEADER_FILE" "$OUTPUT_FILE")"
    final_status="$(printf '%s\n' "$output" | grep -Eo 'HTTP/[0-9.]+ [0-9]{3}' | tail -n1 | awk '{print $2}')"
    effective_url="$(printf '%s\n' "$output" | sed -n 's/^CURL_EFFECTIVE_URL://p' | tail -n1)"
    redirected_to_404="false"

    if printf '%s\n' "$output" | grep -qiE 'Location:\s*/404\?|errorpath=%2f'; then
      redirected_to_404="true"
    fi
    if [[ "$effective_url" == *"/404"* ]]; then
      redirected_to_404="true"
    fi

    if [[ -z "$final_status" || "$final_status" -ge 400 || "$redirected_to_404" == "true" ]]; then
      printf '%s\t%s\t%s\t%s\t%s\t%s\n' \
        "$id" "$name" "$url" "${final_status:-}" "${effective_url:-$url}" "status_or_404" >>"$TMP_FILE"
    fi
  else
    error_message="$(cat "$ERROR_FILE" "$OUTPUT_FILE" 2>/dev/null | tr '\n' ' ' | sed 's/[[:space:]]\+/ /g' | sed 's/"/\\"/g')"
    printf '%s\t%s\t%s\t%s\t%s\t%s\n' \
      "$id" "$name" "$url" "" "$url" "${error_message:-curl_failed}" >>"$TMP_FILE"
  fi
done < <(
  node -e '
    const fs = require("fs");
    const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    for (const company of data) {
      if (company.primaryJobUrlVerified) {
        console.log([company.id, company.name, company.primaryJobUrl].join("\t"));
      }
    }
  ' "$DATA_FILE"
)

node - "$TMP_FILE" "$checked_count" <<'NODE'
const fs = require("fs");
const file = process.argv[2];
const checkedCount = Number.parseInt(process.argv[3], 10);
const lines = fs.existsSync(file) ? fs.readFileSync(file, "utf8").trim().split("\n").filter(Boolean) : [];
const results = lines.map((line) => {
  const [id, name, url, finalStatus, effectiveUrl, error] = line.split("\t");
  return {
    id,
    name,
    url,
    finalStatus: finalStatus ? Number.parseInt(finalStatus, 10) : null,
    effectiveUrl,
    error
  };
});

console.log(
  JSON.stringify(
    {
      checkedCount,
      failureCount: results.length,
      checkedAt: new Date().toISOString(),
      results
    },
    null,
    2
  )
);
NODE
