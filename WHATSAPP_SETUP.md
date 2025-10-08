# 📱 WhatsApp Integration Guide

## Overview

Your Mobile For You app now has **full WhatsApp integration** for automated business notifications. Here's everything you need to know about setting it up and going to production.

## 🔧 Current Setup (Testing with Sandbox)

### What's Working:
- ✅ Admin notifications for new orders (with product details)
- ✅ Admin notifications for low stock alerts
- ✅ Customer order confirmations (if phone number is set)
- ✅ Payment reminders
- ✅ Reserved order nudges

### Twilio Sandbox Limitations:
- ⚠️ **Users must join sandbox** by sending "join [code]" to the Twilio number
- ⚠️ **24-hour session limit** - users must rejoin if inactive
- ⚠️ **Limited to approved templates**
- ⚠️ **Not suitable for production**

### How to Join Sandbox:
1. Save `+1 (415) 523-8886` in your contacts
2. Send: `join home-caught` (your sandbox code)
3. You'll receive a confirmation message
4. Now you can receive WhatsApp notifications!

---

## 🚀 Going to Production (Without Sandbox)

To send WhatsApp messages **automatically without users joining**, you need to upgrade to Twilio Production:

### Step 1: Get a Twilio Phone Number
1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Phone Numbers** → **Buy a Number**
3. Search for a number that supports WhatsApp
4. Purchase the number (~$1-2/month)

### Step 2: Enable WhatsApp on Your Number
1. Go to **Messaging** → **Try it Out** → **WhatsApp**
2. Follow the wizard to enable WhatsApp
3. You'll need to provide:
   - Business name
   - Business description
   - Business website
   - Business category

### Step 3: Create a WhatsApp Business Profile
1. Submit your business information for verification
2. Upload business logo/profile picture
3. Wait for Meta/WhatsApp approval (1-3 business days)

### Step 4: Request Template Approval
WhatsApp requires **pre-approved message templates** for production. Submit these templates:

#### Template 1: Order Confirmation (Customer)
```
Name: order_confirmation
Category: ORDER_UPDATE
Language: Hebrew & English
Body:
הזמנה #{{1}} התקבלה בהצלחה! {{2}}
תודה שבחרת ב-Mobile For You.

Order #{{1}} received successfully! {{2}}
Thank you for choosing Mobile For You.
```

#### Template 2: New Order Alert (Admin)
```
Name: admin_new_order
Category: ALERT_UPDATE
Language: Hebrew & English
Body:
🆕 הזמנה חדשה!

הזמנה #{{1}}
לקוח: {{2}}
פריטים: {{3}}

👉 בדוק את לוח הבקרה
```

#### Template 3: Low Stock Alert (Admin)
```
Name: admin_low_stock
Category: ALERT_UPDATE
Language: Hebrew & English
Body:
⚠️ התראת מלאי נמוך!

{{1}} אוזל
מלאי נוכחי: {{2}}
התראה מינימלית: {{3}}

בבקשה להזמין מלאי נוסף
```

#### Template 4: Payment Reminder (Customer)
```
Name: payment_reminder
Category: ACCOUNT_UPDATE
Language: Hebrew & English
Body:
תזכורת תשלום

חשבונית #{{1}}
סכום: {{2}}
תאריך פירעון: {{3}}

נשמח לקבל את התשלום בהקדם.
```

### Step 5: Update Environment Variables
Once approved, update your `.env.local` and Vercel environment:

```env
# Replace sandbox number with your production number
TWILIO_WHATSAPP_FROM=whatsapp:+14155551234  # Your purchased number

# Keep these the same
WHATSAPP_PROVIDER=twilio
WHATSAPP_TEST_MODE=false
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
ADMIN_PHONE=+972546093624  # Your phone in E.164 format
```

### Step 6: Test Production Messages
After templates are approved, test with your production number:
1. Users no longer need to join sandbox
2. Messages sent instantly to any phone number
3. 24-hour session limit removed

---

## 📋 Message Templates Currently Implemented

### 1. **admin_new_order** (Admin Alert)
**When:** New order is created
**To:** Admin phone number
**Example:**
```
🆕 New Order Alert!

Order #ff79b900
From: Adir Buskila

Items:
2× Apple iPhone 15 Pro 256GB
1× Samsung Galaxy S24 128GB

👉 Check admin dashboard for details.
```

### 2. **admin_low_stock** (Admin Alert)
**When:** Product stock falls below minimum threshold
**To:** Admin phone number
**Example:**
```
⚠️ Low Stock Alert!
Apple iPhone 11 128GB is running low
Current stock: 4
Minimum alert: 5
Please restock soon!
```

### 3. **order_confirmation** (Customer Notification)
**When:** Customer creates a new order
**To:** Customer phone number (if set)
**Example:**
```
Order #ff79b900 received: 2× Apple iPhone 15, 1× Samsung Galaxy
```

### 4. **payment_reminder** (Customer Notification)
**When:** Payment is overdue (triggered by cron job)
**To:** Customer phone number
**Example:**
```
Reminder: invoice #N/A amount $150.00 due 11/7/2025.
```

### 5. **reserved_nudge** (Customer Notification)
**When:** Order is in draft status for 3+ days
**To:** Customer phone number
**Example:**
```
Order #ff79b900 is waiting for pickup.
```

### 6. **delivery_notice** (Customer Notification)
**When:** Manually triggered for order delivery
**To:** Customer phone number
**Example:**
```
Order #ff79b900 is on the way today.
```

---

## 🔑 Adding Customer Phone Numbers

For customers to receive WhatsApp notifications, they need phone numbers in the database.

### Option 1: Manual SQL Update (Quick Fix)
```sql
-- Update specific customer
UPDATE clients 
SET phone = '+972501234567' 
WHERE email = 'customer@example.com';

-- Or by name
UPDATE clients 
SET phone = '+972501234567' 
WHERE name = 'Adir Buskila';
```

### Option 2: Add Phone Field to Registration (Future Enhancement)
You could add a phone number field to the customer sign-up/profile page so customers can add it themselves.

---

## 🧪 Testing WhatsApp Notifications

### Test via API Endpoint
```bash
# Test admin new order notification
curl -X POST https://mobileforyou.vercel.app/api/test-whatsapp-simple

# Or locally
curl -X POST http://localhost:3000/api/test-whatsapp-simple
```

### Test by Creating an Order
1. Sign in as a customer
2. Go to `/customer/new-order`
3. Add products to cart
4. Complete the order
5. Check:
   - Admin phone gets new order alert with product details
   - Customer phone gets order confirmation (if phone is set)

### Check Outbound Messages
View all WhatsApp message attempts in Supabase:
```sql
SELECT * FROM outbound_messages 
WHERE channel = 'whatsapp' 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 💰 Pricing Estimate

### Twilio Costs:
- **Phone Number:** ~$1-2/month
- **WhatsApp Messages:** 
  - Outbound: $0.005-0.01 per message (depends on country)
  - Inbound: Free
  
### Example Monthly Cost:
- 100 orders/month = 100 admin alerts + 100 customer confirmations = 200 messages
- 10 low stock alerts
- 20 payment reminders
- **Total:** ~230 messages × $0.007 = **~$1.61/month** + $2 phone = **~$3.61/month**

Very affordable! 💪

---

## 🐛 Troubleshooting

### Messages Not Sending?

Run diagnostic script:
```bash
node scripts/check-whatsapp-setup.js
```

### Common Issues:

1. **"User not in sandbox"**
   - Solution: Send `join home-caught` to +1 (415) 523-8886

2. **"Customer not receiving messages"**
   - Check if customer has phone number: `node scripts/check-client-phone.js`
   - Add phone number via SQL

3. **"Admin not receiving alerts"**
   - Check `ADMIN_PHONE` environment variable
   - Ensure phone is in E.164 format (+972...)

4. **"Messages queued but not sent"**
   - Check `WHATSAPP_TEST_MODE` (should be `false` for sending)
   - Check `WHATSAPP_PROVIDER` (should be `twilio`)
   - Verify Twilio credentials

---

## 📚 Resources

- [Twilio Console](https://console.twilio.com/)
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Twilio WhatsApp Sandbox](https://www.twilio.com/docs/whatsapp/sandbox)
- [E.164 Phone Format](https://www.twilio.com/docs/glossary/what-e164)

---

## 🎯 Next Steps

1. **For Testing:** Keep using sandbox, just remember to join
2. **For Production:** 
   - Purchase Twilio phone number
   - Submit templates for approval
   - Update environment variables
   - Remove sandbox requirement
3. **Optional Enhancements:**
   - Add phone number field to customer profile UI
   - Create admin panel to manage customer phone numbers
   - Add WhatsApp opt-in/opt-out functionality
   - Track message delivery status in real-time

Need help with any of these? Let me know! 🚀

