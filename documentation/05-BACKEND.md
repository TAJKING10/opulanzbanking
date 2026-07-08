# 05 — Backend (Express.js API)

## Overview

The backend is an **Express.js** server running on **port 5000**, connected to **Azure PostgreSQL**.

**Entry point:** `backend/src/index.js`

---

## How to Start

```bash
cd C:\Users\Toufi\AndroidStudioProjects\azuree\backend
npm start           # production mode
npm run dev         # development mode (auto-restarts on file change)
```

Expected output:
```
🚀 Opulanz Banking API running on port 5000
✅ Connected to Azure PostgreSQL
```

---

## All API Endpoints

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Returns `{ status: "ok" }` — used to check if server is running |

### Users (`/api/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get single user |
| POST | `/api/users` | Create user |
| PATCH | `/api/users/:id` | Update user |

### Applications (`/api/applications`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/applications` | List all KYC/KYB applications |
| GET | `/api/applications/:id` | Get single application |
| POST | `/api/applications` | Create new application (individual or company) |
| PATCH | `/api/applications/:id` | Update application status |

### Companies (`/api/companies`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/companies` | List all companies |
| POST | `/api/companies` | Create company record |
| GET | `/api/companies/:id` | Get single company |

### Appointments (`/api/appointments`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | List all appointments |
| GET | `/api/appointments/:id` | Get single appointment |
| POST | `/api/appointments` | Create appointment (used by all booking flows) |
| PATCH | `/api/appointments/:id` | Update appointment |

### PayPal (`/api/paypal`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/paypal/create-order` | Create PayPal order, returns `{ orderId }` |
| POST | `/api/paypal/capture-order/:orderId` | Capture (complete) a PayPal payment |

### Tax Advisory Bookings (`/api/tax-advisory-bookings`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tax-advisory-bookings` | List all tax advisory bookings |
| POST | `/api/tax-advisory-bookings` | Create booking |
| GET | `/api/tax-advisory-bookings/:id` | Get booking |

### Life Insurance Bookings (`/api/life-insurance-bookings`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/life-insurance-bookings` | List all life insurance bookings |
| POST | `/api/life-insurance-bookings` | Create booking |
| GET | `/api/life-insurance-bookings/:id` | Get booking |

### Documents (`/api/documents`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | List all documents |
| POST | `/api/documents/generate` | Generate PDF from application data |
| POST | `/api/documents/send-for-signature` | Send document to DocuSign for signature |
| GET | `/api/documents/:id` | Get document details + DocuSign status |

### Document Generation (`/api/document-generation`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/document-generation/kyc` | Generate KYC questionnaire PDF |
| POST | `/api/document-generation/mission-letter` | Generate mission letter PDF |

### KYC (`/api/kyc`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/kyc/submit` | Submit KYC form data |
| GET | `/api/kyc/:id` | Get KYC status |

### Sumsub (`/api/sumsub`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sumsub/create-applicant` | Create Sumsub applicant |
| GET | `/api/sumsub/access-token/:applicantId` | Get SDK access token |
| POST | `/api/sumsub/webhook` | Receive Sumsub verification results |

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/google` | Login with Google OAuth |
| POST | `/api/auth/refresh` | Refresh JWT token |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/totp/setup` | Setup 2FA (TOTP) |
| POST | `/api/auth/totp/verify` | Verify TOTP code |

### Uploads (`/api/upload`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/document` | Upload file to Azure Blob Storage |
| GET | `/api/upload/:filename` | Download file |
| DELETE | `/api/upload/:filename` | Delete file |

### Notifications (`/api/notifications`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications for user |
| POST | `/api/notifications/send-email` | Send email notification |

### Support (`/api/support`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/support/ticket` | Create support ticket |
| GET | `/api/support/tickets` | List tickets |

### AI Chat (`/api/chat`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/message` | Send message to Claude AI chatbot |

### Narvi Banking (`/api/narvi`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/narvi/customers` | Create Narvi customer |
| GET | `/api/narvi/customers/:id` | Get customer |
| POST | `/api/narvi/companies` | Create Narvi company |

### Investment Portal (`/api/investment-*`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/investment-admins` | Manage investment admins |
| GET/POST | `/api/investment-investors` | Manage investors |
| GET/POST | `/api/investment-properties` | Manage properties |
| GET/POST | `/api/investments` | Manage investments |
| GET/POST | `/api/investment-activity` | Activity logs |
| POST | `/api/investment-contact` | Contact form |

---

## Backend File Structure

```
backend/
├── src/
│   ├── index.js                          ← Main server entry point
│   ├── config/
│   │   └── db.js                         ← PostgreSQL connection pool
│   ├── routes/
│   │   ├── applications.js
│   │   ├── appointments.js
│   │   ├── auth.js
│   │   ├── chat.js
│   │   ├── companies.js
│   │   ├── document-generation.js
│   │   ├── documents.js
│   │   ├── investment-activity.js
│   │   ├── investment-admins.js
│   │   ├── investment-contact.js
│   │   ├── investment-investors.js
│   │   ├── investment-properties.js
│   │   ├── investments.js
│   │   ├── kyc.js
│   │   ├── life-insurance-bookings.js
│   │   ├── narvi.js
│   │   ├── notifications.js
│   │   ├── paypal.js
│   │   ├── sumsub.js
│   │   ├── support-chats.js
│   │   ├── support.js
│   │   ├── tax-advisory-bookings.js
│   │   ├── upload.js
│   │   └── users.js
│   ├── services/
│   │   ├── azureStorage.js             ← Azure Blob Storage
│   │   ├── docusign.js                 ← DocuSign signing
│   │   ├── emailService.js             ← Email sending
│   │   └── pdfGenerator.js             ← PDF creation
│   └── migrations/
│       ├── *.sql                        ← Database schemas
│       ├── run-migration.js             ← Run single migration
│       └── run-all-migrations.js       ← Run all migrations
└── package.json
```

---

## How PayPal API Works (Backend)

**File:** `backend/src/routes/paypal.js`

```
POST /api/paypal/create-order
    1. Gets PayPal access token using Client ID + Secret
    2. Calls PayPal API: POST /v2/checkout/orders
    3. Returns { orderId } to frontend

POST /api/paypal/capture-order/:orderId
    1. Gets PayPal access token
    2. Calls PayPal API: POST /v2/checkout/orders/:orderId/capture
    3. Returns capture result (status, payer info)
```

PayPal API URL:
- Sandbox: `https://api-m.sandbox.paypal.com`
- Live: `https://api-m.paypal.com`

---

## How Email Works (Backend)

**File:** `backend/src/services/emailService.js`

Uses **Nodemailer** with Gmail SMTP:
- Server: `smtp.gmail.com`
- Port: `587`
- Auth: Gmail App Password (not the regular Gmail password)

Emails are sent automatically when:
- A booking is created (Calendly event)
- A payment is captured (PayPal)
- An application is submitted (KYC/KYB)
- A document is sent for signature (DocuSign)

---

## Testing the Backend with curl

```bash
# Health check
curl http://localhost:5000/health

# Create a PayPal order
curl -X POST http://localhost:5000/api/paypal/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": "150.00", "currency": "EUR", "description": "Tax Advisory"}'

# List appointments
curl http://localhost:5000/api/appointments

# Create appointment
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{"type":"investment_advisory","status":"confirmed","customer_info":{"firstName":"John","email":"john@example.com"}}'
```
