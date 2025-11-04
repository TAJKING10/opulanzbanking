# API Testing Guide

Quick reference for testing the Opulanz Banking API endpoints.

## Prerequisites

- Server running on `http://localhost:5000`
- curl installed (comes with Git Bash on Windows)

---

## Health Check

```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Opulanz Banking API is running",
  "timestamp": "2025-11-04T..."
}
```

---

## Get API Information

```bash
curl http://localhost:5000/
```

**Expected Response:**
```json
{
  "message": "Opulanz Banking Platform API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "users": { ... }
  }
}
```

---

## Users API

### 1. Get All Users

```bash
curl http://localhost:5000/api/users
```

**Expected Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@opulanz.com",
      "role": "admin",
      "created_at": "2025-11-04T..."
    }
  ]
}
```

### 2. Get User by ID

```bash
curl http://localhost:5000/api/users/1
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@opulanz.com",
    "role": "admin",
    "created_at": "2025-11-04T..."
  }
}
```

### 3. Create New User

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Alice Brown\",\"email\":\"alice.brown@opulanz.com\",\"role\":\"user\"}"
```

**Windows PowerShell:**
```powershell
curl.exe -X POST http://localhost:5000/api/users -H "Content-Type: application/json" -d "{\"name\":\"Alice Brown\",\"email\":\"alice.brown@opulanz.com\",\"role\":\"user\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 4,
    "name": "Alice Brown",
    "email": "alice.brown@opulanz.com",
    "role": "user",
    "created_at": "2025-11-04T..."
  }
}
```

### 4. Update User

```bash
curl -X PUT http://localhost:5000/api/users/4 \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Alice Brown Updated\",\"role\":\"admin\"}"
```

**Windows PowerShell:**
```powershell
curl.exe -X PUT http://localhost:5000/api/users/4 -H "Content-Type: application/json" -d "{\"name\":\"Alice Brown Updated\",\"role\":\"admin\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 4,
    "name": "Alice Brown Updated",
    "email": "alice.brown@opulanz.com",
    "role": "admin",
    "created_at": "2025-11-04T..."
  }
}
```

### 5. Delete User

```bash
curl -X DELETE http://localhost:5000/api/users/4
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": 4,
    "name": "Alice Brown",
    "email": "alice.brown@opulanz.com"
  }
}
```

---

## Error Responses

### User Not Found (404)

```bash
curl http://localhost:5000/api/users/999
```

**Response:**
```json
{
  "success": false,
  "error": "User not found"
}
```

### Duplicate Email (409)

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test\",\"email\":\"john.doe@opulanz.com\"}"
```

**Response:**
```json
{
  "success": false,
  "error": "User with this email already exists"
}
```

### Missing Required Fields (400)

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test\"}"
```

**Response:**
```json
{
  "success": false,
  "error": "Name and email are required"
}
```

---

## Using Postman

If you prefer a GUI tool:

1. **Install Postman** - https://www.postman.com/downloads/

2. **Import Collection:**
   - Create new collection "Opulanz Banking API"
   - Add requests for each endpoint above

3. **Set Base URL:**
   - Create environment variable: `baseUrl = http://localhost:5000`
   - Use `{{baseUrl}}` in requests

---

## Testing with Browser DevTools

Open your browser console and run:

```javascript
// Get all users
fetch('http://localhost:5000/api/users')
  .then(res => res.json())
  .then(data => console.log(data));

// Create user
fetch('http://localhost:5000/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@opulanz.com',
    role: 'user'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## Automated Testing Script

Save as `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000"

echo "Testing Opulanz Banking API..."
echo ""

echo "1. Health Check"
curl -s $BASE_URL/health | json_pp
echo ""

echo "2. Get All Users"
curl -s $BASE_URL/api/users | json_pp
echo ""

echo "3. Create User"
curl -s -X POST $BASE_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@opulanz.com","role":"user"}' | json_pp
echo ""

echo "Tests completed!"
```

Run with: `bash test-api.sh`

---

**Happy Testing!**
