# 📧 OTP & Email Implementation Guide

## ✅ What Was Implemented

### 1. **Full Email Sending Functionality**
- Integrated **NodeMailer** for reliable SMTP-based email delivery
- Professional HTML email templates with branded styling
- Support for multiple email providers (Gmail, Outlook, Yahoo, SendGrid, etc.)
- Error handling and logging for email failures

### 2. **OTP Security with Hashing**
- OTPs are now **hashed using bcrypt** before storage
- Plain OTPs are never stored in the database
- Hash comparison during verification ensures maximum security
- Automatic deletion of OTP records after verification or expiration

### 3. **Database Improvements**
- Added `hashedOtp` field to OTP model for secure storage
- Added TTL index to automatically delete expired OTPs from database
- Added `createdAt` timestamp for audit tracking

### 4. **Enhanced Security Measures**
- 5-minute OTP expiration with automatic cleanup
- Bcrypt hashing with salt rounds: 10
- OTP records deleted after successful verification
- Detailed error messages for debugging while maintaining security

---

## 📋 Files Modified

| File | Changes |
|------|---------|
| `package.json` | Added `bcrypt` and `nodemailer` dependencies |
| `src/utils/mailer.ts` | Implemented full email sending with HTML templates |
| `src/models/otp.model.ts` | Added `hashedOtp` field and TTL index |
| `src/modules/auth/auth.service.ts` | Implemented bcrypt hashing and verification |
| `.env.example` | New template for environment configuration |
| `README.md` | Updated email setup instructions |

---

## 🔧 Configuration Setup

### Step 1: Copy Environment Template
```bash
cp .env.example .env
```

### Step 2: Configure Email Service

#### **Option A: Gmail (Recommended)**
1. Go to https://myaccount.google.com/apppasswords
2. Sign in with your Gmail account
3. Select "App passwords" (requires 2FA enabled)
4. Choose "Mail" and "Windows Computer"
5. Copy the generated 16-character password
6. Update `.env`:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

#### **Option B: Other Providers**
Gmail-compatible services (Outlook, Yahoo, etc.):
```env
EMAIL_SERVICE=outlook  # or yahoo, sendgrid, etc.
EMAIL_USER=your_email@provider.com
EMAIL_PASSWORD=your_password
```

#### **Option C: Custom SMTP**
Edit `src/utils/mailer.ts` to configure custom SMTP:
```typescript
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

---

## 🔐 Security Features Explained

### OTP Hashing Process
```
User sends: /auth/send-otp?usn=12345678
           ↓
System generates: OTP = "123456"
           ↓
System hashes: hashedOtp = bcrypt.hash("123456", 10)
           ↓
Database stores: { usn: "12345678", hashedOtp: "$2b$10$..." }
           ↓
Sends plain OTP to email: "Your OTP is 123456"
```

### OTP Verification Process
```
User sends: /auth/verify-otp with usn="12345678", otp="123456"
           ↓
System retrieves: Record with hashedOtp from database
           ↓
System compares: bcrypt.compare("123456", hashedOtp)
           ↓
If match ✓: Generate JWT and DELETE OTP record
If no match ✗: Throw "Invalid OTP" error
```

---

## 📧 Email Template Features

The email includes:
- ✅ Professional branding (Peer Awards header)
- ✅ Large, easy-to-read OTP display
- ✅ Security warnings and best practices
- ✅ 5-minute expiration notice
- ✅ Responsive HTML design
- ✅ Footer with system info

---

## 🧪 Testing the Implementation

### Test Scenario 1: Send OTP
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"usn": "12345678"}'
```

**Expected Response:**
```json
{
  "message": "OTP sent",
  "email": "user@***"
}
```

**Terminal Output:**
```
✅ Email sent successfully to user@example.com
```

### Test Scenario 2: Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"usn": "12345678", "otp": "123456"}'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Test Scenario 3: Invalid OTP (Security Test)
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"usn": "12345678", "otp": "000000"}'
```

**Expected Response:**
```json
{
  "message": "Invalid OTP"
}
```

---

## 🐛 Troubleshooting

### Issue: "Failed to send email"
**Solutions:**
1. Verify `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
2. Check internet connection
3. For Gmail: Ensure App Password (not regular password) is used
4. Check firewall/antivirus blocking port 587

### Issue: "Invalid OTP" on correct OTP
**Solutions:**
1. OTP might have expired (5-minute window)
2. Request a new OTP
3. Check server time synchronization

### Issue: Dependency errors
**Solutions:**
```bash
# Clean reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Database Schema Updates

### OTP Model (Updated)
```typescript
{
  usn: String,                    // User's USN
  email: String,                  // User's email
  otp: String,                    // Deprecated - undefined (kept for compatibility)
  hashedOtp: String,              // Bcrypt hashed OTP
  expiresAt: Date,                // Expiration timestamp
  createdAt: {                    // Creation timestamp
    type: Date,
    default: new Date()
  }
}

// TTL Index: Automatically deletes records after expiration
```

---

## 🔄 Migration Notes

### For Existing OTP Records
If you have existing OTP records with plain text OTPs:
```javascript
// Optional: Clear all old OTP records (data loss)
db.otps.deleteMany({})

// Or: Mark as expired
db.otps.updateMany({}, { expiresAt: new Date() })
```

---

## 🏆 Best Practices

✅ **Do:**
- Regenerate app password if compromised
- Rotate `JWT_SECRET` periodically
- Monitor email delivery failures
- Test in staging environment first

❌ **Don't:**
- Commit `.env` file to repository
- Use regular Gmail password (use App Password)
- Share OTP via insecure channels
- Log OTPs or sensitive data

---

## 📖 References

- **NodeMailer Docs**: https://nodemailer.com/
- **Bcrypt Docs**: https://www.npmjs.com/package/bcrypt
- **Gmail App Passwords**: https://support.google.com/accounts/answer/185833

---

## ✨ Next Steps

1. ✅ Install dependencies (`npm install` - already done)
2. ✅ Configure `.env` with email credentials
3. ✅ Test OTP sending and verification
4. ✅ Deploy to production with verified credentials
5. ✅ Monitor email delivery logs

---

**Implementation completed on:** April 13, 2026
**Security level:** Production-ready with bcrypt hashing
