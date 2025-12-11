# 🔍 Calendly Booking Debug Guide

## Step-by-Step Test Instructions

### 1. Open Browser Console FIRST
- Press `F12` to open DevTools
- Click on the **Console** tab
- Keep it open during the entire booking process

### 2. Clear Everything
In the console, type:
```javascript
localStorage.clear(); location.reload();
```

### 3. Start Booking Flow
1. Go to: http://localhost:3000/en/tax-advisory/international-tax
2. Click "Book Your Consultation Now"

### 4. Book on Calendly
1. Select a date and time
2. Fill in:
   - Name: "Test User"
   - Email: "test@example.com"
3. Click "Schedule Event" or "Confirm"

### 5. Watch the Console!
You should see these messages appear:
```
🎯 Calendly Event: calendly.event_scheduled
📦 Full event data: {...}
✅ EVENT SCHEDULED! Processing...
📋 Payload: {...}
📅 Event object: {...}
👤 Invitee object: {...}
📝 Extracted booking info: {...}
✅ Booking data is valid! Moving to payment...
```

---

## ✅ If It Works:
- You'll see all the green checkmarks (✅) in console
- Page automatically moves to Payment step
- You'll see your name, email, date, and time on the payment page
- Complete PayPal payment normally

---

## ❌ If It Doesn't Work:

### Check Console for Errors:
Look for red messages (❌):
- "No payload received from Calendly"
- "Missing required booking data"
- "Error processing Calendly event"

### What the Console Will Show:
Copy and send me the EXACT console output, especially:
1. The "Full event data" object
2. The "Event object"
3. The "Invitee object"
4. The "Extracted booking info"

### Automatic Fallback:
If Calendly fails, you'll see an alert:
- "Calendly booking failed. Please use Manual Booking instead."
- OR: "Some booking information is missing. Please try Manual Booking instead."

The page will automatically switch to Manual Booking mode.

---

## 🎯 Manual Booking (Always Works)

If Calendly fails OR if you see the alert:
1. You'll see the Manual Booking form
2. Fill in:
   - Full Name
   - Email Address
   - Preferred Date
   - Preferred Time
3. Click "Continue to Payment"
4. Complete PayPal payment
5. Done! ✅

---

## 📊 What I'm Looking For:

When you book through Calendly, check if console shows:
- ✅ inviteeName has a value (your name)
- ✅ inviteeEmail has a value (your email)
- ✅ eventStartTime has a value (the date/time)

If ANY of these is empty (""), that's the problem!

---

## 🚨 Common Issues:

### Issue: "Invalid booking data: Object"
**Cause:** Calendly sent an empty object
**Solution:** Use Manual Booking

### Issue: Page doesn't move to payment
**Cause:** Calendly event not captured
**Solution:** Check console for messages, use Manual Booking

### Issue: "Not provided" on payment page
**Cause:** Booking data missing required fields
**Solution:** System will auto-detect and redirect to calendar

---

## 💡 Pro Tip:
The Manual Booking option is actually BETTER because:
- ✅ No waiting for Calendly API
- ✅ Faster booking
- ✅ 100% reliable
- ✅ Same payment and confirmation flow

Just use Manual Booking if you want to skip Calendly entirely!
