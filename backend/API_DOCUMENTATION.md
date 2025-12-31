# Opulanz Banking Backend API Documentation

## 🚀 Quick Start

The backend is now fully operational and ready for integration!

### Server Information
- **Base URL**: `http://localhost:5000`
- **Database**: Azure PostgreSQL (SSL enabled)
- **Framework**: Node.js + Express.js
- **Status**: ✅ All tests passed (20/20)

### Start the Server
```bash
cd backend
npm start
```

### Run Tests
```bash
cd backend
node test-api.js
```

---

## 📋 Database Tables

All tables have been created and are ready to use:

| Table | Description | Sample Records |
|-------|-------------|----------------|
| `users` | User accounts | 4 |
| `applications` | KYC/KYB submissions | 3 |
| `documents` | Document metadata | 3 |
| `companies` | Company information | 3 |
| `appointments` | Calendly bookings | 3 |

---

## 🔌 API Endpoints

### Health Check

#### `GET /health`
Check if the API server is running.

**Response:**
```json
{
  "status": "ok",
  "message": "Opulanz Banking API is running",
  "timestamp": "2025-11-04T01:00:00.000Z"
}
```

---

### Applications API

Manage KYC (individual) and KYB (company) applications.

#### `POST /api/applications`
Create a new application.

**Request Body:**
```json
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

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "individual",
    "status": "submitted",
    "payload": {...},
    "created_at": "2025-11-04T01:00:00.000Z",
    "updated_at": "2025-11-04T01:00:00.000Z"
  }
}
```

#### `GET /api/applications`
List all applications (with filters).

**Query Parameters:**
- `type`: `individual` | `company`
- `status`: `draft` | `submitted` | `under_review` | `approved` | `rejected`
- `limit`: number (default: 50)
- `offset`: number (default: 0)

**Example:**
```bash
GET /api/applications?status=submitted&limit=10
```

#### `GET /api/applications/:id`
Get a single application by ID.

#### `PATCH /api/applications/:id`
Update an application (status, Narvi ID, etc.).

**Request Body:**
```json
{
  "status": "approved",
  "narvi_customer_id": "narvi_cust_abc123"
}
```

#### `DELETE /api/applications/:id`
Delete an application.

---

### Documents API

Manage document metadata (passports, IDs, proofs, etc.).

#### `POST /api/applications/:id/documents`
Attach a document to an application.

**Request Body:**
```json
{
  "file_name": "passport_toufic.pdf",
  "file_url": "https://storage.example.com/docs/passport_toufic.pdf",
  "type": "passport",
  "file_size": 2048576,
  "mime_type": "application/pdf"
}
```

**Document Types:**
- `passport`
- `national_id`
- `drivers_license`
- `proof_of_address`
- `bank_statement`
- `utility_bill`
- `company_registration`
- `articles_of_association`
- `shareholder_register`
- `other`

#### `GET /api/applications/:id/documents`
List all documents for an application.

#### `GET /api/documents/:id`
Get a single document by ID.

#### `PATCH /api/documents/:id`
Update document (verification status, notes).

**Request Body:**
```json
{
  "status": "verified",
  "verification_notes": "Passport verified - valid until 2030"
}
```

#### `DELETE /api/documents/:id`
Delete a document.

---

### Companies API

Manage company information for business accounts.

#### `POST /api/companies`
Create a new company.

**Request Body:**
```json
{
  "name": "Advensys Trading SARL",
  "registration_number": "B234567",
  "country": "LU",
  "legal_form": "SARL",
  "industry": "Trading",
  "email": "contact@advensys-trading.lv",
  "phone": "+352-123-456-789",
  "registered_address": {
    "street": "1 Avenue de la Liberté",
    "city": "Luxembourg",
    "zip": "1009",
    "country": "LU"
  }
}
```

#### `GET /api/companies`
List all companies (with filters).

**Query Parameters:**
- `country`: 2-letter ISO code (e.g., `LU`, `FR`)
- `industry`: industry name
- `limit`: number (default: 50)
- `offset`: number (default: 0)

#### `GET /api/companies/:id`
Get a single company by ID.

#### `PATCH /api/companies/:id`
Update company information.

**Request Body:**
```json
{
  "phone": "+352-999-888-777",
  "narvi_company_id": "narvi_comp_abc123"
}
```

#### `DELETE /api/companies/:id`
Delete a company.

---

### Appointments API

Manage Calendly appointment bookings.

#### `POST /api/appointments`
Create a new appointment.

**Request Body:**
```json
{
  "full_name": "Toufic Jandah",
  "email": "toufic@advensys-trading.lv",
  "phone": "+352-123-456-789",
  "calendly_id": "evt_calendly_001",
  "meeting_type": "Account Opening Consultation",
  "start_time": "2025-11-05T10:00:00Z",
  "end_time": "2025-11-05T10:30:00Z",
  "timezone": "Europe/Luxembourg"
}
```

#### `GET /api/appointments`
List all appointments (with filters).

**Query Parameters:**
- `status`: `scheduled` | `confirmed` | `completed` | `cancelled` | `no_show`
- `email`: customer email
- `from`: start date (ISO 8601)
- `to`: end date (ISO 8601)
- `limit`: number (default: 50)
- `offset`: number (default: 0)

**Example:**
```bash
GET /api/appointments?status=scheduled&from=2025-11-01&to=2025-11-30
```

#### `GET /api/appointments/:id`
Get a single appointment by ID.

#### `PATCH /api/appointments/:id`
Update appointment (status, notes).

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Successful consultation - client will proceed with account opening"
}
```

#### `DELETE /api/appointments/:id`
Delete an appointment.

---

## 🔗 Frontend Integration Examples

### Fetch API (JavaScript)

```javascript
// Create an application
const createApplication = async (formData) => {
  const response = await fetch('http://localhost:5000/api/applications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'individual',
      status: 'submitted',
      payload: formData,
    }),
  });

  const result = await response.json();
  return result;
};

// Get applications
const getApplications = async (status = null) => {
  const url = status
    ? `http://localhost:5000/api/applications?status=${status}`
    : 'http://localhost:5000/api/applications';

  const response = await fetch(url);
  const result = await response.json();
  return result.data;
};

// Upload document metadata
const uploadDocument = async (applicationId, documentData) => {
  const response = await fetch(
    `http://localhost:5000/api/applications/${applicationId}/documents`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(documentData),
    }
  );

  const result = await response.json();
  return result;
};

// Create appointment
const createAppointment = async (appointmentData) => {
  const response = await fetch('http://localhost:5000/api/appointments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(appointmentData),
  });

  const result = await response.json();
  return result;
};
```

### React Example

```jsx
import { useState, useEffect } from 'react';

function ApplicationForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    // ...
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'individual',
          status: 'submitted',
          payload: formData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Application created! ID: ${result.data.id}`);
        // Redirect to success page or next step
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit">Submit Application</button>
    </form>
  );
}
```

---

## 📊 Response Format

All endpoints follow a consistent response format:

### Success Response
```json
{
  "success": true,
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

### List Response (with pagination)
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0
  }
}
```

---

## 🔐 Security Features

- ✅ **Helmet.js** - Security headers
- ✅ **CORS** - Cross-origin resource sharing enabled
- ✅ **SSL/TLS** - PostgreSQL connection encrypted
- ✅ **Input Validation** - Request body validation
- ✅ **SQL Injection Prevention** - Parameterized queries
- ✅ **Error Handling** - Comprehensive error messages

---

## 🗄️ Database Schema

### Applications Table
```sql
id                 SERIAL PRIMARY KEY
type               VARCHAR(50) NOT NULL  -- 'individual' | 'company'
status             VARCHAR(50) NOT NULL  -- 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
payload            JSONB NOT NULL
narvi_customer_id  VARCHAR(255)
narvi_company_id   VARCHAR(255)
rejection_reason   TEXT
approved_at        TIMESTAMP
rejected_at        TIMESTAMP
created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Documents Table
```sql
id                   SERIAL PRIMARY KEY
application_id       INTEGER NOT NULL (FK → applications.id)
file_name            VARCHAR(255) NOT NULL
file_url             TEXT NOT NULL
file_size            INTEGER
mime_type            VARCHAR(100)
type                 VARCHAR(100) NOT NULL  -- 'passport', 'national_id', etc.
status               VARCHAR(50) DEFAULT 'pending'  -- 'pending' | 'verified' | 'rejected'
verification_notes   TEXT
verified_at          TIMESTAMP
created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Companies Table
```sql
id                   SERIAL PRIMARY KEY
name                 VARCHAR(255) NOT NULL
registration_number  VARCHAR(100) NOT NULL
country              VARCHAR(2) NOT NULL
legal_form           VARCHAR(100)
industry             VARCHAR(100)
tax_id               VARCHAR(100)
incorporation_date   DATE
registered_address   JSONB
business_address     JSONB
website              VARCHAR(255)
phone                VARCHAR(50)
email                VARCHAR(255)
number_of_employees  INTEGER
annual_revenue       DECIMAL(15, 2)
narvi_company_id     VARCHAR(255)
created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Appointments Table
```sql
id                   SERIAL PRIMARY KEY
full_name            VARCHAR(255) NOT NULL
email                VARCHAR(255) NOT NULL
phone                VARCHAR(50)
calendly_id          VARCHAR(255) UNIQUE
calendly_event_uri   TEXT
meeting_type         VARCHAR(100)
status               VARCHAR(50) DEFAULT 'scheduled'  -- 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
start_time           TIMESTAMP NOT NULL
end_time             TIMESTAMP NOT NULL
timezone             VARCHAR(100)
location             TEXT
notes                TEXT
cancel_reason        TEXT
cancelled_at         TIMESTAMP
completed_at         TIMESTAMP
created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

---

## 🧪 Testing

### Run All Tests
```bash
cd backend
node test-api.js
```

**Test Coverage:**
- ✅ Health check
- ✅ Applications CRUD (5 tests)
- ✅ Documents CRUD (4 tests)
- ✅ Companies CRUD (5 tests)
- ✅ Appointments CRUD (5 tests)

**Total: 20 tests - All passing ✅**

---

## 🚀 Next Steps

### 1. Calendly Integration
- Set up Calendly webhook to POST to `/api/appointments`
- Store `calendly_id` and `calendly_event_uri`
- Handle event updates and cancellations

### 2. Narvi Integration (When Keys Available)
Add Narvi service module:
```javascript
// src/services/narvi.js
const createNarviCustomer = async (applicationData) => {
  // Call Narvi API
  // Return narvi_customer_id
};

const createNarviCompany = async (companyData) => {
  // Call Narvi API
  // Return narvi_company_id
};
```

Then update applications when approved:
```javascript
// When application.status = 'approved'
const narviCustomerId = await createNarviCustomer(application.payload);
await updateApplication(id, { narvi_customer_id: narviCustomerId });
```

### 3. File Upload (Azure Blob Storage)
Add file upload endpoint:
```javascript
POST /api/uploads
// Returns signed URL for direct upload to Azure Blob
// Then save final URL to documents.file_url
```

### 4. Deployment
- Deploy to Azure App Service
- Set environment variables
- Configure firewall rules
- Point frontend to production API URL

---

## 📞 Support

For questions or issues:
- Check logs: Server outputs detailed error messages
- Review this documentation
- Test endpoints using the test script: `node test-api.js`

---

**Last Updated**: November 4, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
