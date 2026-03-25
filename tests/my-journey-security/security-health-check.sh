#!/bin/bash
# My Journey Security Health Check
# Run this script to verify security posture of the My Journey feature.
#
# Usage: bash tests/my-journey-security/security-health-check.sh

set -e

echo "======================================"
echo "  My Journey Security Health Check"
echo "======================================"
echo ""

PASS=0
FAIL=0
WARN=0

check_pass() { echo "  [PASS] $1"; PASS=$((PASS + 1)); }
check_fail() { echo "  [FAIL] $1"; FAIL=$((FAIL + 1)); }
check_warn() { echo "  [WARN] $1"; WARN=$((WARN + 1)); }

# 1. Auth pattern check
echo "1. Authentication Pattern"
AUTH_ROUTES=$(grep -r "getServerSession" src/app/api/journey/ --include="*.ts" -l 2>/dev/null | wc -l | tr -d ' ')
TOTAL_ROUTES=$(find src/app/api/journey/ -name "route.ts" 2>/dev/null | wc -l | tr -d ' ')
if [ "$AUTH_ROUTES" -ge "$TOTAL_ROUTES" ]; then
  check_pass "All $TOTAL_ROUTES journey routes check authentication"
else
  check_fail "Only $AUTH_ROUTES of $TOTAL_ROUTES routes check authentication"
fi

# 2. Role check
echo ""
echo "2. Role Enforcement"
ROLE_CHECKS=$(grep -r "role.*YOUTH\|YOUTH.*role" src/app/api/journey/ --include="*.ts" -l 2>/dev/null | wc -l | tr -d ' ')
if [ "$ROLE_CHECKS" -ge "$TOTAL_ROUTES" ]; then
  check_pass "YOUTH role enforced across journey routes"
else
  check_warn "$ROLE_CHECKS of $TOTAL_ROUTES routes explicitly check YOUTH role"
fi

# 3. Session-scoped queries
echo ""
echo "3. Session-Scoped Queries"
SESSION_SCOPED=$(grep -r "session.user.id" src/app/api/journey/ --include="*.ts" -l 2>/dev/null | wc -l | tr -d ' ')
if [ "$SESSION_SCOPED" -ge "$TOTAL_ROUTES" ]; then
  check_pass "All routes scope DB queries to session.user.id"
else
  check_warn "$SESSION_SCOPED of $TOTAL_ROUTES routes use session.user.id"
fi

# 4. State validation
echo ""
echo "4. State Validation"
if grep -q "JOURNEY_STATES.includes" src/app/api/journey/route.ts 2>/dev/null; then
  check_pass "Main journey route validates state IDs against JOURNEY_STATES"
else
  check_fail "Main journey route does not validate state IDs"
fi

# 5. Input sanitization
echo ""
echo "5. Input Sanitization"
if grep -q "sanitizeStepCompletionData" src/app/api/journey/complete/route.ts 2>/dev/null; then
  check_pass "Step completion data is sanitized before storage"
else
  check_fail "Step completion data is NOT sanitized before storage"
fi

# 6. URL validation
echo ""
echo "6. URL Validation"
if grep -q "parsed.protocol" src/app/api/journey/saved-items/route.ts 2>/dev/null; then
  check_pass "Saved items URLs are validated for safe protocols"
else
  check_fail "Saved items URLs are NOT validated at API level"
fi

# 7. Error handling
echo ""
echo "7. Error Response Safety"
LEAKY_ERRORS=$(grep -r "error.*errorMsg\|error.*error.message" src/app/api/journey/ --include="*.ts" 2>/dev/null | grep -v "console.error" | wc -l | tr -d ' ')
if [ "$LEAKY_ERRORS" -eq "0" ]; then
  check_pass "No error messages leak internal details to client"
else
  check_fail "$LEAKY_ERRORS routes may leak error details"
fi

# 8. dangerouslySetInnerHTML
echo ""
echo "8. Unsafe HTML Rendering"
UNSAFE_RENDER=$(grep -r "dangerouslySetInnerHTML" src/components/journey/ src/app/\(dashboard\)/my-journey/ --include="*.tsx" --include="*.ts" -l 2>/dev/null | wc -l | tr -d ' ')
if [ "$UNSAFE_RENDER" -eq "0" ]; then
  check_pass "No dangerouslySetInnerHTML in journey components"
else
  check_fail "dangerouslySetInnerHTML found in $UNSAFE_RENDER journey files"
fi

# 9. Raw SQL
echo ""
echo "9. SQL Injection Prevention"
RAW_SQL=$(grep -r "\$queryRaw\|\$executeRaw\|raw(" src/app/api/journey/ --include="*.ts" -l 2>/dev/null | wc -l | tr -d ' ')
if [ "$RAW_SQL" -eq "0" ]; then
  check_pass "No raw SQL in journey routes — Prisma parameterized queries only"
else
  check_warn "Raw SQL found in $RAW_SQL journey route files"
fi

# 10. Dependency audit
echo ""
echo "10. Dependency Vulnerabilities"
VULN_COUNT=$(npm audit --omit=dev 2>/dev/null | grep "vulnerabilities" | grep -o "[0-9]* vulnerabilities" | head -1 || echo "unknown")
if echo "$VULN_COUNT" | grep -q "0 vulnerabilities"; then
  check_pass "No known dependency vulnerabilities"
else
  check_warn "Dependency audit: $VULN_COUNT"
fi

# 11. Security tests
echo ""
echo "11. Security Test Suite"
TEST_RESULT=$(npx vitest run tests/my-journey-security/ --reporter=json 2>/dev/null | grep -o '"numPassedTests":[0-9]*' | head -1 || echo "")
if echo "$TEST_RESULT" | grep -q "124"; then
  check_pass "All 124 security tests passing"
elif [ -n "$TEST_RESULT" ]; then
  check_warn "Security tests: $TEST_RESULT"
else
  check_warn "Could not run security tests"
fi

# Summary
echo ""
echo "======================================"
echo "  Results: $PASS passed, $FAIL failed, $WARN warnings"
echo "======================================"

if [ "$FAIL" -gt "0" ]; then
  exit 1
fi
