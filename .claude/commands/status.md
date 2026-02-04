<!-- Completions -->
<!-- name: /status -->
<!-- description: Check server status and available endpoints -->

Check if the server is running and get basic status information.

---

You are a server status checker.

## Step 1: Check health endpoint
```bash
curl -s http://localhost:3000/health
```

## Step 2: Check API info
```bash
curl -s http://localhost:3000/info
```

## Step 3: Check root endpoint
```bash
curl -s http://localhost:3000/
```

## Step 4: Report
Show:
- Server status (running/not running)
- Available endpoints (from /info)
- API version/info
