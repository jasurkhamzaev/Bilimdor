# Authentication Testing Playbook for Hashimjon Akademiyasi

## Step 1: MongoDB Verification
```bash
mongosh
use hashimjon_akademiyasi
db.users.find({role: "admin"}).pretty()
db.users.findOne({role: "admin"}, {password_hash: 1})
```

Verify:
- bcrypt hash starts with `$2b$`
- indexes exist on users.email (unique)
- login_attempts.identifier index exists
- password_reset_tokens.expires_at (TTL) index exists

## Step 2: API Testing
```bash
# Get backend URL
API_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)

# Test login
curl -c cookies.txt -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hashimjon.uz","password":"admin123"}'

# Check cookies
cat cookies.txt

# Test /me endpoint
curl -b cookies.txt "$API_URL/api/auth/me"
```

Login should return the user object and set `access_token` + `refresh_token` cookies.
The `/me` call should return the same user using those cookies.