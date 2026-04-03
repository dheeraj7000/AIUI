#!/bin/bash
# AIUI Smoke Test — checks all major endpoints

BASE="http://localhost:3000"
PASS=0
FAIL=0

check() {
  local name="$1"
  local url="$2"
  local expect="$3"

  local body
  body=$(curl -s --max-time 10 "$url" 2>&1)

  if echo "$body" | grep -q "$expect"; then
    echo "  ✓ $name"
    PASS=$((PASS + 1))
  else
    echo "  ✗ $name (expected '$expect')"
    FAIL=$((FAIL + 1))
  fi
}

echo "AIUI Smoke Test"
echo "==============="
echo ""

echo "API Health:"
check "Health endpoint" "$BASE/api/health" '"status":"ok"'

echo ""
echo "Pages (HTML renders):"
check "Landing page" "$BASE/" "Control how AI"
check "Sign in" "$BASE/sign-in" "Sign in to your account"
check "Sign up" "$BASE/sign-up" "Create your account"
check "Dashboard" "$BASE/dashboard" "Style Packs"
check "Style packs" "$BASE/style-packs" "style-packs"
check "Components" "$BASE/components" "component"
check "Import" "$BASE/import" "Import Design"
check "Studio" "$BASE/studio" "studio"

echo ""
echo "Database (data loaded):"
check "Style packs count" "$BASE/dashboard" ">6<"
check "Components count" "$BASE/dashboard" ">57<"

echo ""
echo "Results: $PASS passed, $FAIL failed"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
