# HelloPay - Production Launch Dashboard

This document provides the final production configurations, deployment guides, and launch checklist for the HelloPay ecosystem.

## 1. Security & Hardening (Completed)
- **Helmet**: Secured HTTP headers for production.
- **Rate Limiter**: Protected all API endpoints (100 reqs/15 min/IP).
- **Validation**: Strict input verification for Auth and Transfers.
- **Logging**: Winston-based file logging (`error.log`, `combined.log`).
- **Data Integrity**: MongoDB/Mongoose sessions for atomic wallet operations.

## 2. Deployment Guide

### Phase A: Backend (Cloud Deployment)
1. **Target Platforms**: Render, Railway, or AWS App Runner.
2. **Setup**:
   - Link your GitHub repository.
   - Set Root Directory to `backend/`.
   - Install Command: `npm install`.
   - Start Command: `npm start`.
3. **Environment Variables**:
   ```text
   NODE_ENV=production
   PORT=5000
   MONGO_URI=your_production_mongodb_uri
   JWT_SECRET=your_high_entropy_secret
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

### Phase B: Web & Admin App (Vercel)
1. **Target Platform**: Vercel.
2. **Setup**:
   - Connect GitHub.
   - Set Framework Preset to `Next.js`.
   - Root Directory: `web-app/` (and `admin-panel/`).
3. **Environment Variables**:
   ```text
   NEXT_PUBLIC_API_URL=https://api.hellopay.com/api
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
   ```

### Phase C: Mobile App (APK Build)
1. **Requirements**: Flutter SDK installed on local machine.
2. **Commands**:
   ```bash
   cd mobile-app
   flutter clean
   flutter pub get
   # To build an appbundle for Play Store
   flutter build appbundle
   # To build a direct APK
   flutter build apk --release
   ```
3. **Optimizations**:
   - Split by ABI: `flutter build apk --split-per-abi`.
   - Ensure `lib/services/api_service.dart` points to your LIVE API URL.

## 3. Pre-Launch Checklist
- [ ] **API Health**: Run `node test.js` against the production URL.
- [ ] **SSL Verification**: Ensure all `https` endpoints are valid.
- [ ] **CORS**: Verify backend allows production domains.
- [ ] **Payment Mode**: Switch Razorpay from `test` to `live` in dashboard.
- [ ] **Database Indexes**: Ensure MongoDB indexes are created for `phone` and `email`.

## 4. Performance Metrics
- **Pagination**: Implemented in `/api/transactions/history` (default 10 per page).
- **Logging**: Real-time error monitoring actively writing to `backend/error.log`.

---
© 2026 HelloPay Financial Ecosystem. All Rights Reserved.
