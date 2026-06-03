# StayDine - Setup & Installation Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v14.0.0 or higher ([Download](https://nodejs.org/))
- **MongoDB** v4.4 or higher ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/))
- **npm** (comes with Node.js)

## 🛠️ Backend Setup

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create Environment File
```bash
cp .env.example .env
```

### Step 4: Configure Environment Variables
Edit `backend/.env` and update the following:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/restaurant-pos

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Twilio (for WhatsApp integration)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_FROM=+91xxxxxxxxxx

# Razorpay (for payments)
RAZORPAY_KEY_ID=razorpay_key_id
RAZORPAY_KEY_SECRET=razorpay_key_secret

# Cloudinary (for image uploads)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### Step 5: Start MongoDB
```bash
# On Windows
mongod

# On Mac/Linux
brew services start mongodb-community
```

### Step 6: Start Backend Server
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

Backend will be running at `http://localhost:5000`

### Verification
Test the backend:
```bash
curl http://localhost:5000/health
# Should return: {"status":"OK","timestamp":"2026-06-03T..."}
```

## 🎨 Frontend Setup

### Step 1: Navigate to Frontend Directory
```bash
cd frontend
```

### Step 2: Update API URL (Optional)
If your backend is running on a different URL, edit `js/api-client.js`:

```javascript
const API_BASE_URL = 'http://your-backend-url:port/api';
```

### Step 3: Start Frontend Server
Choose one option:

**Option A: Python HTTP Server**
```bash
# Python 3
python -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```

**Option B: Node.js HTTP Server**
```bash
npx http-server -p 3000
```

**Option C: npm http-server**
```bash
npm install -g http-server
http-server -p 3000
```

Frontend will be running at `http://localhost:3000`

## 📊 Database Initialization

### Create Collections (Automatic)

MongoDB collections will be created automatically when:
1. The server starts and connects to MongoDB
2. First data is inserted into each collection

To manually create collections and indexes:

```bash
# Connect to MongoDB
mongo mongodb://localhost:27017/restaurant-pos

# Collections will be created on first document insert
db.users.insertOne({ _id: "init" })
db.restaurants.insertOne({ _id: "init" })
# ... etc
```

## 🔐 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Phone & Google)
4. Get your credentials from Project Settings
5. Add to `.env` file

## 💳 Payment Gateway Setup (Razorpay)

1. Sign up at [Razorpay](https://razorpay.com/)
2. Get your API Key and Secret
3. Add to `.env` file
4. Test mode keys are provided for development

## 📲 WhatsApp Integration Setup (Twilio)

1. Sign up at [Twilio](https://www.twilio.com/)
2. Create a WhatsApp Sender number
3. Get Account SID and Auth Token
4. Add to `.env` file
5. Get a test WhatsApp number from Twilio Sandbox

## 🖼️ Cloudinary Setup (Image Storage)

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret
3. Add to `.env` file
4. Start uploading images

## 📱 Using the Application

### 1. Access the Application
Open your browser and go to:
```
http://localhost:3000
```

### 2. Create an Account
- Choose "Sign Up"
- Select user type (Restaurant Owner, Staff, Customer)
- Fill in details
- Create account

### 3. Login
- Use phone number and password
- You'll be redirected based on your role

### 4. Different User Roles

**Restaurant Owner/Admin:**
- Access: `http://localhost:3000/pages/admin-dashboard.html`
- Features: All dashboard, analytics, user management

**Manager:**
- Access: `http://localhost:3000/pages/dashboard.html`
- Features: Order management, staff monitoring

**Cashier/Billing Staff:**
- Access: `http://localhost:3000/pages/billing.html`
- Features: Fast billing, payment processing

**Kitchen Staff:**
- Access: `http://localhost:3000/pages/kitchen.html`
- Features: KOT display, order status management

**Regular Staff:**
- Access: `http://localhost:3000/pages/attendance.html`
- Features: Check-in/out with biometric & GPS

**Customer:**
- Access: `http://localhost:3000/pages/customer-menu.html?table=1`
- Features: Browse menu, place orders, track status

## 🧪 Testing

### Test Credentials

```
Test Restaurant Owner:
- Phone: +91 9999999999
- Password: password123

Test Staff Member:
- Phone: +91 9999999998
- Password: password123

Test Customer:
- Phone: +91 9999999997
- Password: password123
```

### API Testing with cURL

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919999999999","password":"password123"}'
```

**Create Order:**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "restaurantId":"xxx",
    "items":[{"menuItemId":"xxx","quantity":1,"price":200}],
    "tableNumber":1,
    "totalAmount":210
  }'
```

**Check-in for Attendance:**
```bash
curl -X POST http://localhost:5000/api/attendance/check-in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId":"xxx",
    "restaurantId":"xxx",
    "latitude":28.7041,
    "longitude":77.1025,
    "faceData":[...],
    "imageUrl":"data:image/..."
  }'
```

## 🚀 Deployment

### Deploy Backend (Heroku)

1. Install Heroku CLI
```bash
npm install -g heroku
```

2. Login to Heroku
```bash
heroku login
```

3. Create Heroku app
```bash
heroku create your-app-name
```

4. Add MongoDB Atlas URL
```bash
heroku config:set MONGODB_URI=mongodb+srv://...
```

5. Deploy
```bash
git push heroku main
```

### Deploy Frontend (Vercel)

1. Install Vercel CLI
```bash
npm install -g vercel
```

2. Deploy
```bash
cd frontend
vercel
```

## 📝 Troubleshooting

### Issue: MongoDB Connection Error
**Solution:**
```bash
# Make sure MongoDB is running
mongod

# Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/restaurant-pos
```

### Issue: CORS Error
**Solution:** 
Frontend and backend must be on correct URLs. Update in `js/api-client.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

### Issue: Camera/Location Permission Denied
**Solution:**
- Check browser permissions for camera and location
- Firefox: Preferences > Privacy & Security > Permissions
- Chrome: Settings > Privacy and security > Site Settings

### Issue: Face Recognition Not Working
**Solution:**
- Ensure good lighting
- Face should be clearly visible
- Check that face-api.js models are loaded
- Open browser console and check for errors

### Issue: Port Already in Use
**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Use different port
PORT=5001 npm run dev
```

## 📚 Documentation

- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [Features Documentation](./docs/FEATURES.md)

## 🤝 Support

For help or issues:
1. Check the troubleshooting section above
2. Review console logs (F12 > Console)
3. Check network tab for API errors
4. Open an issue on GitHub

## ✅ Checklist

Before going live:

- [ ] Update all environment variables
- [ ] Test all payment methods
- [ ] Configure WhatsApp integration
- [ ] Set up Firebase Auth
- [ ] Test camera and location features
- [ ] Verify all pages load
- [ ] Test on mobile devices
- [ ] Set up HTTPS
- [ ] Enable CORS properly
- [ ] Backup database
- [ ] Set up monitoring
- [ ] Create admin account

---

**Last Updated:** 2026-06-03  
**Version:** 1.0.0
