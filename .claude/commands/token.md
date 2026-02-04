<!-- Completions -->
<!-- name: /token -->
<!-- description: Get fresh auth token quickly -->

Get a fresh JWT auth token by logging in.

---

You are a token fetcher.

## Step 1: Login
```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@fitnessfirstelite.com\",\"password\":\"Admin123!\"}"
```

## Step 2: Extract and display
Parse the response and show:
- User ID
- Access token (full)
- Role
- Expiration time

Format for easy copying:
```bash
export TOKEN="<token>"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/<protected-endpoint>
```
