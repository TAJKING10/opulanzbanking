# 08 — Calendly Integration

## Overview

Calendly is used for appointment scheduling across three services. The calendar widget is embedded directly in the page — users never leave the site to book.

---

## Account

| Setting | Value |
|---------|-------|
| Calendly Account | `opulanz-banking` |
| Calendly Profile URL | `https://calendly.com/opulanz-banking` |
| Login | via the email used to create the account |

---

## Event Types (Booking URLs)

These are the Calendly event types configured for each service:

| Service | Language | URL Slug | Full URL |
|---------|----------|----------|----------|
| Tax Advisory | English | `tax-advisory` | `https://calendly.com/opulanz-banking/tax-advisory` |
| Tax Advisory | French | `conseil-fiscal` | `https://calendly.com/opulanz-banking/conseil-fiscal` |
| Life Insurance | English | `investment-advisory-clone` | `https://calendly.com/opulanz-banking/investment-advisory-clone` |
| Life Insurance | French | `assurance-vie` | `https://calendly.com/opulanz-banking/assurance-vie` |
| Investment Advisory | English | `tax-advisory-clone` | `https://calendly.com/opulanz-banking/tax-advisory-clone` |
| Investment Advisory | French | `conseil-en-investissement` | `https://calendly.com/opulanz-banking/conseil-en-investissement` |

---

## How to Create a New Event Type in Calendly

1. Log in at https://calendly.com
2. Click **+ New Event Type**
3. Choose **One-on-One**
4. Set:
   - **Event name**: e.g., "Investment Advisory Consultation"
   - **Duration**: 60 minutes
   - **Location**: Video call (Zoom, Teams, or custom)
   - **Availability**: Set your working hours
   - **Slug** (URL name): e.g., `investment-advisory`
5. Click **Create**
6. Copy the URL slug and add it to the frontend code

---

## How the Widget Is Embedded

**Method 1 — Simple inline (Tax Advisory page)**

```html
<!-- Load the Calendly script -->
<Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />

<!-- Embed the widget -->
<div
  className="calendly-inline-widget"
  data-url="https://calendly.com/opulanz-banking/tax-advisory?hide_event_type_details=1&primary_color=d8ba4a"
  style={{ minWidth: '320px', height: '700px' }}
/>
```

**Method 2 — With pre-filled name & email (Investment Advisory, Life Insurance)**

```html
<div
  className="calendly-inline-widget"
  data-url={`https://calendly.com/opulanz-banking/tax-advisory-clone?hide_event_type_details=1&primary_color=b59354&name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email)}`}
  style={{ minWidth: '320px', height: '700px' }}
/>
```

**URL Parameters:**
| Parameter | Description |
|-----------|-------------|
| `hide_event_type_details=1` | Hides Calendly branding/details |
| `primary_color=b59354` | Brand gold color (without #) |
| `name=John+Doe` | Pre-fills the name field |
| `email=john@example.com` | Pre-fills the email field |

---

## Detecting When a Booking is Made

Calendly sends a browser message when a booking is completed:

```javascript
window.addEventListener("message", (e) => {
  if (e.data?.event === "calendly.event_scheduled") {
    const payload = e.data.payload;
    console.log("Event URI:", payload.event.uri);
    console.log("Invitee URI:", payload.invitee.uri);
    console.log("Start time:", payload.event.start_time);
    console.log("End time:", payload.event.end_time);
    // → Save to backend, show confirmation
  }
});
```

---

## What Gets Saved After Booking

When a Calendly booking is made, the frontend saves to the backend:

```json
{
  "type": "investment_advisory",
  "status": "confirmed",
  "customer_info": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+352 123 456 789"
  },
  "appointment": {
    "date": "2026-07-10T14:00:00Z",
    "time": "02:00 PM",
    "calendlyEventUrl": "https://api.calendly.com/scheduled_events/...",
    "calendlyInviteeUrl": "https://api.calendly.com/scheduled_events/.../invitees/..."
  },
  "payment": {
    "method": "paypal",
    "status": "completed",
    "orderId": "6GD..."
  }
}
```

---

## Calendly API (Advanced)

If you need to read bookings programmatically (e.g., list appointments in admin):

1. Go to https://calendly.com/integrations/api_webhooks
2. Generate a **Personal Access Token**
3. Use the Calendly v2 API:
   ```
   GET https://api.calendly.com/scheduled_events
   Authorization: Bearer YOUR_TOKEN
   ```

---

## Cancellation / Rescheduling

Users can cancel or reschedule via links in the Calendly confirmation email. You do not need to handle this in the code — Calendly manages it automatically.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Widget shows blank | Check the URL slug matches your Calendly event |
| Widget doesn't load | Check the `widget.js` script is loaded |
| Booking event not detected | Check `window.addEventListener("message", ...)` is set up |
| Wrong language showing | Ensure the correct locale-based URL is used |
| Color doesn't match | Set `primary_color` without the `#` symbol |
