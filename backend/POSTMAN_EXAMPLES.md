# Postman Test Examples

Quick copy-paste examples for testing the API in Postman.

---

## 📋 Applications

### Create Individual Application
```http
POST http://localhost:5000/api/applications
Content-Type: application/json

{
  "type": "individual",
  "status": "submitted",
  "payload": {
    "firstName": "Toufic",
    "lastName": "Jandah",
    "email": "toufic@advensys-trading.lv",
    "dob": "1992-08-13",
    "nationality": "FR",
    "address": {
      "street": "1 Rue Example",
      "city": "Luxembourg",
      "zip": "1009",
      "country": "LU"
    }
  }
}
```

### Create Company Application
```http
POST http://localhost:5000/api/applications
Content-Type: application/json

{
  "type": "company",
  "status": "submitted",
  "payload": {
    "companyName": "Tech Solutions SA",
    "registrationNumber": "B123456",
    "country": "LU",
    "industry": "Technology",
    "contactPerson": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@techsolutions.lu"
    }
  }
}
```

### List All Applications
```http
GET http://localhost:5000/api/applications
```

### List Submitted Applications
```http
GET http://localhost:5000/api/applications?status=submitted
```

### Get Application by ID
```http
GET http://localhost:5000/api/applications/1
```

### Update Application Status
```http
PATCH http://localhost:5000/api/applications/1
Content-Type: application/json

{
  "status": "approved",
  "narvi_customer_id": "narvi_cust_abc123"
}
```

### Reject Application
```http
PATCH http://localhost:5000/api/applications/1
Content-Type: application/json

{
  "status": "rejected",
  "rejection_reason": "Missing required documents"
}
```

---

## 📄 Documents

### Upload Passport
```http
POST http://localhost:5000/api/applications/1/documents
Content-Type: application/json

{
  "file_name": "passport_toufic.pdf",
  "file_url": "https://storage.example.com/docs/passport_toufic.pdf",
  "type": "passport",
  "file_size": 2048576,
  "mime_type": "application/pdf"
}
```

### Upload Proof of Address
```http
POST http://localhost:5000/api/applications/1/documents
Content-Type: application/json

{
  "file_name": "utility_bill_nov_2025.pdf",
  "file_url": "https://storage.example.com/docs/utility_bill.pdf",
  "type": "utility_bill",
  "file_size": 1024000,
  "mime_type": "application/pdf"
}
```

### List Documents for Application
```http
GET http://localhost:5000/api/applications/1/documents
```

### Get Document by ID
```http
GET http://localhost:5000/api/documents/1
```

### Verify Document
```http
PATCH http://localhost:5000/api/documents/1
Content-Type: application/json

{
  "status": "verified",
  "verification_notes": "Passport verified - valid until 2030"
}
```

### Reject Document
```http
PATCH http://localhost:5000/api/documents/1
Content-Type: application/json

{
  "status": "rejected",
  "verification_notes": "Document image is blurry - please re-upload"
}
```

---

## 🏢 Companies

### Create Company
```http
POST http://localhost:5000/api/companies
Content-Type: application/json

{
  "name": "Advensys Trading SARL",
  "registration_number": "B234567",
  "country": "LU",
  "legal_form": "SARL",
  "industry": "Trading",
  "tax_id": "LU12345678",
  "incorporation_date": "2020-01-15",
  "email": "contact@advensys-trading.lv",
  "phone": "+352-123-456-789",
  "website": "https://advensys-trading.lv",
  "registered_address": {
    "street": "1 Avenue de la Liberté",
    "city": "Luxembourg",
    "zip": "1009",
    "country": "LU"
  },
  "number_of_employees": 25,
  "annual_revenue": 5000000
}
```

### List All Companies
```http
GET http://localhost:5000/api/companies
```

### List Companies in Luxembourg
```http
GET http://localhost:5000/api/companies?country=LU
```

### List Technology Companies
```http
GET http://localhost:5000/api/companies?industry=Technology
```

### Get Company by ID
```http
GET http://localhost:5000/api/companies/1
```

### Update Company
```http
PATCH http://localhost:5000/api/companies/1
Content-Type: application/json

{
  "phone": "+352-999-888-777",
  "email": "new-contact@advensys-trading.lv",
  "narvi_company_id": "narvi_comp_abc123",
  "annual_revenue": 6000000
}
```

---

## 📅 Appointments

### Create Appointment (from Calendly)
```http
POST http://localhost:5000/api/appointments
Content-Type: application/json

{
  "full_name": "Toufic Jandah",
  "email": "toufic@advensys-trading.lv",
  "phone": "+352-123-456-789",
  "calendly_id": "evt_calendly_001",
  "calendly_event_uri": "https://api.calendly.com/scheduled_events/AAAA",
  "meeting_type": "Account Opening Consultation",
  "start_time": "2025-11-05T10:00:00Z",
  "end_time": "2025-11-05T10:30:00Z",
  "timezone": "Europe/Luxembourg",
  "location": "Video Call"
}
```

### List All Appointments
```http
GET http://localhost:5000/api/appointments
```

### List Scheduled Appointments
```http
GET http://localhost:5000/api/appointments?status=scheduled
```

### List Appointments for Date Range
```http
GET http://localhost:5000/api/appointments?from=2025-11-01T00:00:00Z&to=2025-11-30T23:59:59Z
```

### List Appointments by Email
```http
GET http://localhost:5000/api/appointments?email=toufic@advensys-trading.lv
```

### Get Appointment by ID
```http
GET http://localhost:5000/api/appointments/1
```

### Confirm Appointment
```http
PATCH http://localhost:5000/api/appointments/1
Content-Type: application/json

{
  "status": "confirmed"
}
```

### Complete Appointment with Notes
```http
PATCH http://localhost:5000/api/appointments/1
Content-Type: application/json

{
  "status": "completed",
  "notes": "Successful consultation - client will proceed with account opening. Discussed individual account options and investment advisory services."
}
```

### Cancel Appointment
```http
PATCH http://localhost:5000/api/appointments/1
Content-Type: application/json

{
  "status": "cancelled",
  "cancel_reason": "Client rescheduled for next week"
}
```

### Mark as No-Show
```http
PATCH http://localhost:5000/api/appointments/1
Content-Type: application/json

{
  "status": "no_show",
  "notes": "Client did not attend scheduled meeting"
}
```

---

## 🧪 Quick Test Sequence

Test the full flow in order:

### 1. Create an Application
```http
POST http://localhost:5000/api/applications
Content-Type: application/json

{
  "type": "individual",
  "status": "submitted",
  "payload": {
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "dob": "1990-01-01",
    "nationality": "LU"
  }
}
```
**Save the returned `id` (e.g., 5)**

### 2. Upload Documents
```http
POST http://localhost:5000/api/applications/5/documents
Content-Type: application/json

{
  "file_name": "passport.pdf",
  "file_url": "https://storage/passport.pdf",
  "type": "passport",
  "file_size": 2000000,
  "mime_type": "application/pdf"
}
```

### 3. Verify Document
```http
PATCH http://localhost:5000/api/documents/1
Content-Type: application/json

{
  "status": "verified",
  "verification_notes": "All clear"
}
```

### 4. Approve Application
```http
PATCH http://localhost:5000/api/applications/5
Content-Type: application/json

{
  "status": "approved",
  "narvi_customer_id": "narvi_cust_test_789"
}
```

### 5. Create Follow-up Appointment
```http
POST http://localhost:5000/api/appointments
Content-Type: application/json

{
  "full_name": "Test User",
  "email": "test@example.com",
  "phone": "+352-123-456",
  "meeting_type": "Account Activation",
  "start_time": "2025-11-10T14:00:00Z",
  "end_time": "2025-11-10T14:30:00Z",
  "timezone": "Europe/Luxembourg"
}
```

---

## 🔍 Health Check
```http
GET http://localhost:5000/health
```

## 📚 API Overview
```http
GET http://localhost:5000/
```

---

## 💡 Tips

1. **Copy the full block** including the HTTP method, URL, headers, and body
2. **Paste into Postman** as a new request
3. **Replace IDs** (`:id`) with actual IDs from your database
4. **Check response** - all endpoints return `{ "success": true/false, "data": {...} }`

---

**Ready to test!** 🚀
