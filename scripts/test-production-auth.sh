#!/bin/bash

# Test production authentication setup
# Usage: ./scripts/test-production-auth.sh

FRONTEND_URL="https://boilerplate.lumineau.app"
BACKEND_URL="https://api.boilerplate.lumineau.app"

echo "🔍 Testing Production Authentication Setup"
echo "========================================="
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"
echo ""

# Test 1: Backend Health Check
echo "1. Testing Backend Health..."
curl -s "$BACKEND_URL/api/health" | jq . || echo "❌ Backend health check failed"
echo ""

# Test 2: CORS Preflight
echo "2. Testing CORS Preflight..."
curl -s -X OPTIONS "$BACKEND_URL/api/auth/session" \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v 2>&1 | grep -E "(Access-Control-Allow-|HTTP/)" || echo "❌ CORS preflight failed"
echo ""

# Test 3: Session Debug Endpoint
echo "3. Testing Session Debug Endpoint..."
curl -s "$BACKEND_URL/api/auth/session-debug" \
  -H "Origin: $FRONTEND_URL" \
  | jq . || echo "❌ Session debug endpoint failed"
echo ""

# Test 4: Login Flow (you'll need to replace with actual credentials)
echo "4. Testing Login Flow..."
echo "Please test manually:"
echo "  a) Go to $FRONTEND_URL/login"
echo "  b) Login with test credentials"
echo "  c) Check cookies in DevTools:"
echo "     - Should see 'better-auth.session_token'"
echo "     - Domain should be '.lumineau.app'"
echo "     - Secure and HttpOnly should be true"
echo "     - SameSite should be 'None'"
echo ""

# Test 5: Debug Page
echo "5. Debug Page URL:"
echo "   $FRONTEND_URL/debug"
echo ""
echo "   This page will show:"
echo "   - Session status"
echo "   - Cookie configuration"
echo "   - Environment details"
echo ""

echo "✅ Automated tests complete. Please perform manual login test."