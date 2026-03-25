# JalRakshak Firebase Integration Guide

## Overview

JalRakshak now features a complete real-time Firebase backend integration that connects citizen reports to the admin dashboard with real-time synchronization, image uploads, and team assignment tracking.

## Features

### 1. **Real-Time Complaint Management**

- Complaints are stored in Firestore with real-time listeners
- Admin dashboard updates automatically when new reports arrive
- Status changes sync instantly across all devices

### 2. **Image Upload to Firebase Storage**

- Citizens can attach photos to their reports
- Images are uploaded to Firebase Storage with automatic CDN delivery
- Thumbnail previews in admin dashboard

### 3. **Report Tracking**

- Citizens can track their reports by:
  - Phone number
  - Report ID
- Real-time status updates (pending → assigned → resolved)
- Estimated resolution time based on severity

### 4. **Admin Dashboard Controls**

- View all incoming complaints with filtering
- Filter by status, severity, or category
- Assign teams to complaints
- Update report status
- View detailed complaint information with images

### 5. **Map Visualization**

- Display all complaints on interactive map
- Color-coded markers:
  - 🔴 **Red** = High Priority
  - 🟠 **Orange** = Moderate Priority
  - 🟢 **Green** = Low Priority
- Clickable markers with full complaint details
- Real-time map updates

### 6. **Severity Classification**

Severity is automatically calculated based on:

- **Water Level**: ankle, knee, waist, neck, head
- **Category**: overflow, blockage, broken pipe

## Firebase Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Name your project (e.g., "JalRakshak")
4. Complete the setup

### Step 2: Enable Firestore Database

1. In Firebase Console, navigate to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode**
4. Select your preferred region (preferably India)
5. Click **Create**

### Step 3: Create Database Collections

#### Collection: `complaints`

Create a collection with automatic ID generation. Add the following index:

**Fields indexed:**

- `status` (Ascending)
- `severity` (Descending)
- `createdAt` (Descending)

**Document Structure:**

```json
{
  "id": "auto-generated",
  "userId": "user-timestamp",
  "name": "Reporter Name",
  "phone": "9876543210",
  "location": "Street Address",
  "lat": 19.076,
  "lng": 72.8777,
  "category": "surface_flooding",
  "waterLevel": "knee",
  "description": "Detailed description",
  "imageUrl": "https://storage.googleapis.com/...",
  "status": "pending",
  "severity": "high",
  "assignedTo": "Team A",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### Step 4: Configure Firestore Security Rules

Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read complaints
    match /complaints/{document=**} {
      allow read;
      // Allow write only from authenticated users (optional)
      allow create;
      allow update: if request.auth != null || true;
    }
  }
}
```

### Step 5: Enable Firebase Storage

1. Go to **Storage** in Firebase Console
2. Click **Get Started**
3. Accept the default storage location
4. Update security rules to:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /complaints/{allPaths=**} {
      allow read;
      allow create;
      allow delete: if request.auth != null;
    }
  }
}
```

### Step 6: Get Your Firebase Config

1. In Firebase Console, go to **Project Settings**
2. Scroll to "Your apps"
3. Click the Web app icon (</> )
4. Copy the Firebase config

### Step 7: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Firebase config from Step 6:

   ```
   VITE_FIREBASE_API_KEY=YOUR_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
   VITE_FIREBASE_APP_ID=YOUR_APP_ID
   ```

3. Restart your dev server:
   ```bash
   npm run dev
   ```

## Project Structure

### Services

- **`src/services/firebaseService.ts`** - Core Firebase initialization and Firestore/Storage operations
- **`src/services/reportSubmissionUtils.ts`** - Report validation and submission logic
- **`src/services/reportTrackingUtils.ts`** - Report tracking and status utilities
- **`src/services/mapUtils.ts`** - Map marker creation and visualization helpers

### Components

- **`src/components/ComplaintsManager.tsx`** - Admin dashboard real-time complaint viewer
- **`src/components/TrackMyReport.tsx`** - Public report tracking interface
- **`src/components/ComplaintsMap.tsx`** - Interactive map with complaint markers
- **`src/components/CitizenDashboard.tsx`** - Updated with Firebase report submission
- **`src/components/AdminDashboard.tsx`** - Updated with ComplaintsManager integration

## Usage

### For Citizens: Submit a Report

1. Open JalRakshak app
2. Go to "Report Flooding"
3. Fill in all required fields:
   - Location (auto-detected via GPS)
   - Contact number
   - Water level
   - Category
   - Description
   - Photo/Video proof
4. Click "Submit Report"
5. Save your report ID for tracking

### For Citizens: Track Your Report

1. Click "Track My Report"
2. Enter either:
   - Your phone number, OR
   - Your report ID
3. View real-time status:
   - **Pending**: Being reviewed
   - **Assigned**: Team has been dispatched
   - **Resolved**: Issue fixed
4. See assigned team name once status changes

### For Admins: Review Complaints

1. Log in to Admin Dashboard
2. Go to "Reports" tab
3. View real-time complaints with:
   - Color-coded severity (Red/Orange/Green)
   - Status badges
   - Location and timestamp
4. Click to expand for full details
5. Click "Update" to:
   - Change status
   - Assign response team
   - Save changes

### For Admins: View on Map

Use the Complaints Map to:

- See all active incidents on interactive map
- Filter by severity level
- Filter by status
- Click markers for complaint details
- Plan resource deployment

## Data Flow

```
Citizen Report
    ↓
Validation
    ↓
Image Upload to Firebase Storage
    ↓
Store Metadata in Firestore (complaints collection)
    ↓
Real-time Listener updates Admin Dashboard
    ↓
Admin Reviews & Updates Status (pending → assigned → resolved)
    ↓
Firestore triggers updates
    ↓
Citizen sees status change in tracker
    ↓
Map markers reflect severity colors
```

## Real-Time Synchronization

The system uses Firebase's `onSnapshot()` listeners for real-time updates:

1. **Admin Dashboard**: Listens to all complaints collection
2. **Tracker**: Listens to specific phone or ID query
3. **Map**: Listens to filtered complaints by severity/status
4. **Automatic Updates**: When admin updates status, all listeners receive changes instantly

## Error Handling

The system includes comprehensive error handling for:

- Network failures
- Image upload errors
- Firebase connection issues
- Invalid form submissions
- Server-side errors

Errors are displayed to users with:

- Clear error messages
- Retry options
- Fallback UI

## Performance Optimizations

- Indexes on `status`, `severity`, `createdAt` for fast queries
- Image compression before upload
- Pagination for large complaint lists
- Lazy loading of complaint details
- Efficient real-time listener management

## Testing

### Test Report Submission

```javascript
// All data is stored in Firestore
// Check Firebase Console > Firestore > complaints collection
```

### Test Admin Updates

```javascript
// Click "Update" on any complaint
// Change status/team
// Check that tracker updates in real-time
```

### Test Tracking

```javascript
// Submit a report, get report ID
// Go to "Track My Report"
// Enter report ID or phone
// Verify status matches Firestore
```

## Troubleshooting

### Firebase Not Initializing

- Check `.env.local` has correct values
- Verify Firebase project is active
- Check browser console for errors
- Restart dev server

### Images Not Uploading

- Check Storage bucket is enabled
- Verify storage security rules allow uploads
- Check file size < 5MB
- Verify CORS is configured

### Real-time Updates Not Working

- Check Firestore rules allow reads
- Verify browser has internet connection
- Check Firebase Console for connection issues
- Look for errors in browser console

### Complaints Not Appearing in Admin

- Verify Firestore has data in `complaints` collection
- Check `onSnapshot` listeners are subscribed
- Verify status and severity fields exist
- Check browser console for errors

## Security Considerations

### Current Setup

- Public read access to complaints
- Public write access (for simplicity)

### For Production

Consider implementing:

- Authentication (Firebase Auth)
- User authentication checks
- Role-based access control (Admin vs Citizen)
- Rate limiting on report submissions
- Input validation and sanitization
- Image upload size limits and format validation

```javascript
// Example production rule
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /complaints/{doc=**} {
      // Only admins can update
      allow update: if request.auth.token.admin == true;
      // Citizens can only read their own reports
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

## API Reference

### Firebase Service (`firebaseService`)

```typescript
// Initialize Firebase
initializeFirebase(): Promise<boolean>

// Submit complaint
submitComplaint(complaint: Omit<ComplaintReport, 'id' | 'createdAt'>): Promise<string>

// Real-time listener for all complaints
subscribeToComplaints(callback: (complaints: ComplaintReport[]) => void): Unsubscribe

// Get complaints by phone
getComplaintsByPhone(phone: string): Promise<ComplaintReport[]>

// Subscribe to phone-specific complaints
subscribeToComplaintsByPhone(phone: string, callback: (complaints: ComplaintReport[]) => void): Unsubscribe

// Update complaint status
updateComplaintStatus(id: string, status: string, assignedTo?: string): Promise<void>

// Upload image to storage
uploadImage(file: File, path: string): Promise<string>
```

### Report Submission Utilities

```typescript
// Validate form
validateReportForm(formData: ReportFormData): ValidationErrors

// Submit to Firebase
submitReportToFirebase(formData: ReportFormData, onProgress?: (progress: string) => void): Promise<{success: boolean, reportId?: string, error?: string}>

// Format timestamp for display
formatTimestamp(timestamp: any): string

// Get severity color
getSeverityColor(severity: string): string
```

### Report Tracking Utilities

```typescript
// Track by phone
trackReportByPhone(phone: string): Promise<TrackingResult>

// Track by ID
trackReportById(id: string): Promise<TrackingResult>

// Real-time subscription
subscribeToReportUpdates(phone: string, callback: (complaints: ComplaintReport[]) => void, onError?: (error: string) => void): () => void
```

## Future Enhancements

1. **Notifications**: Push notifications to citizens when status changes
2. **Analytics**: Dashboard showing complaint trends and hot spots
3. **Team Management**: Manage response teams and their assignments
4. **Escalation**: Automatic escalation for high-priority complaints
5. **Communication**: Chat between citizens and assigned teams
6. **Mobile App**: Native mobile application with offline support
7. **ML Integration**: AI-powered categorization and routing

## Support

For issues or questions:

1. Check Firestore Console for data integrity
2. Review browser console for errors
3. Verify all env variables are set correctly
4. Check Firebase project settings and quotas

## License

SPDX-License-Identifier: Apache-2.0
