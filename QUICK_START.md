# Firebase Integration - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Firebase (Already Added to package.json)

If you need to install manually:

```bash
npm install firebase@latest
```

### Step 2: Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Firestore Database (Start in production mode)
4. Enable Storage bucket
5. Copy your web config from Project Settings > Your apps

### Step 3: Create `.env.local`

```
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_DOMAIN.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

### Step 4: Start the App

```bash
npm run dev
```

## 📋 Component Usage Examples

### 1. Submit a Report (Citizen Side)

The report submission is already integrated into CitizenDashboard:

```typescript
// Automatically handled in CitizenDashboard.tsx
// When user fills form and clicks submit:
// 1. Form validates
// 2. Image uploads to Firebase Storage
// 3. Report metadata saved to Firestore
// 4. User gets report ID for tracking
```

### 2. Track a Report

Add TrackMyReport to any page:

```typescript
import { TrackMyReport } from './components/TrackMyReport';

export function ReportTracking() {
  return (
    <div className="p-6">
      <TrackMyReport
        initialPhone="+91 XXXXXXXXXX"  // Optional
        onClose={() => {}}              // Optional callback
      />
    </div>
  );
}
```

### 3. Admin Complaints Dashboard

Already integrated in AdminDashboard "Reports" tab:

```typescript
import { ComplaintsManager } from './components/ComplaintsManager';

// Usage in admin dashboard:
<ComplaintsManager
  onComplaintsLoaded={(complaints) => {
    console.log('Received', complaints.length, 'complaints');
  }}
/>
```

### 4. Display Complaints Map

Add the map to any page:

```typescript
import { ComplaintsMap } from './components/ComplaintsMap';

export function MapPage() {
  return (
    <div className="space-y-4">
      <h1>Live Incident Map</h1>
      <ComplaintsMap
        height="600px"           // Custom height
        showFilters={true}       // Show filter controls
      />
    </div>
  );
}
```

## 🔧 Using Firebase Services Directly

### Submit a Complaint

```typescript
import { submitReportToFirebase } from "./services/reportSubmissionUtils";

async function handleSubmit(formData) {
  const result = await submitReportToFirebase(
    {
      name: "John Doe",
      phone: "9876543210",
      address: "123 Main St",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      issueType: "surface_flooding",
      waterLevel: "knee",
      description: "Water flooding on main road",
      image: fileObject,
      latitude: 19.076,
      longitude: 72.8777,
    },
    (progress) => console.log(progress),
  );

  if (result.success) {
    console.log("Report ID:", result.reportId);
  } else {
    console.error("Error:", result.error);
  }
}
```

### Track a Report

```typescript
import { trackReportByPhone } from "./services/reportTrackingUtils";

async function handleTrack(phone) {
  const result = await trackReportByPhone(phone);

  if (result.success) {
    result.complaints.forEach((complaint) => {
      console.log(`${complaint.id}: ${complaint.status}`);
    });
  }
}
```

### Real-time Listening

```typescript
import { firebaseService } from "./services/firebaseService";

function useComplaints() {
  const [complaints, setComplaints] = React.useState([]);

  React.useEffect(() => {
    // Subscribe to all complaints
    const unsubscribe = firebaseService.subscribeToComplaints((data) => {
      setComplaints(data);
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, []);

  return complaints;
}
```

## 📊 Firestore Structure

Your Firestore should have this structure:

```
📦 Firestore
└── 📁 complaints (Collection)
    ├── 📄 complaint-id-1 (Document)
    │   ├── id: "complaint-id-1"
    │   ├── name: "John Doe"
    │   ├── phone: "9876543210"
    │   ├── location: "123 Main St, Mumbai"
    │   ├── lat: 19.0760
    │   ├── lng: 72.8777
    │   ├── waterLevel: "knee"
    │   ├── category: "surface_flooding"
    │   ├── description: "Water flooding..."
    │   ├── imageUrl: "https://storage.googleapis.com/..."
    │   ├── status: "pending"
    │   ├── severity: "high"
    │   ├── assignedTo: null
    │   ├── createdAt: Timestamp
    │   └── updatedAt: Timestamp
    │
    └── 📄 complaint-id-2 (Document)
        └── ... similar structure
```

## 🎯 Common Tasks

### Task 1: Display All Complaints in Admin

```typescript
import { ComplaintsManager } from './components/ComplaintsManager';

export function AdminReportPage() {
  return <ComplaintsManager />;
}
```

### Task 2: Show User Their Reports

```typescript
import { TrackMyReport } from './components/TrackMyReport';

export function UserTracking() {
  const userPhone = "9876543210";
  return <TrackMyReport initialPhone={userPhone} />;
}
```

### Task 3: Visualize Incidents on Map

```typescript
import { ComplaintsMap } from './components/ComplaintsMap';

export function IncidentMap() {
  return (
    <div>
      <h1>Current Incidents</h1>
      <ComplaintsMap height="700px" showFilters={true} />
    </div>
  );
}
```

### Task 4: Get Data Programmatically

```typescript
import { firebaseService } from "./services/firebaseService";

async function getHighPriorityCases() {
  const allComplaints = await firebaseService.getAllComplaints();
  return allComplaints.filter((c) => c.severity === "high");
}

async function getUserReports(phone) {
  return await firebaseService.getComplaintsByPhone(phone);
}
```

### Task 5: Update Complaint Status

```typescript
import { firebaseService } from "./services/firebaseService";

async function assignTeamToComplaint(complaintId, teamName) {
  await firebaseService.updateComplaintStatus(
    complaintId,
    "assigned",
    teamName,
  );
}

async function markAsResolved(complaintId) {
  await firebaseService.updateComplaintStatus(complaintId, "resolved");
}
```

## 🔐 Security Rules for Firebase

### Firestore Rules (Copy to Security Rules)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /complaints/{document=**} {
      // Allow public read
      allow read;

      // Allow anyone to create
      allow create;

      // Allow updates (for team assignment)
      allow update;
    }
  }
}
```

### Storage Rules (Copy to Storage Rules)

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /complaints/{allPaths=**} {
      // Allow public read
      allow read;

      // Allow anyone to upload
      allow create;
    }
  }
}
```

## 🐛 Debugging

### Check if Firebase is Initialized

```typescript
import { firebaseService } from "./services/firebaseService";

console.log("Firebase Ready:", firebaseService.isInitialized());
```

### Monitor Real-time Updates

```typescript
firebaseService.subscribeToComplaints((complaints) => {
  console.log("Complaints updated:", complaints.length, "items");
  complaints.forEach((c) => {
    console.log(`[${c.severity}] ${c.location}: ${c.status}`);
  });
});
```

### Check Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Firestore Database
4. Look for `complaints` collection
5. Expand documents to see data

## 📱 URL Schemes

If you want to add deep linking:

```typescript
// Track report by URL
// example.com/track?phone=9876543210
// example.com/track?id=complaint-id-123

// View map
// example.com/map

// Submit report
// example.com/report
```

## 🧪 Testing Checklist

- [ ] Environment variables are set in `.env.local`
- [ ] Firebase project is created and active
- [ ] Firestore database is enabled
- [ ] Storage bucket is created
- [ ] Security rules are deployed
- [ ] Can submit a report
- [ ] Image uploads to Storage
- [ ] Report appears in Firestore
- [ ] Admin dashboard shows report
- [ ] Can track report by phone
- [ ] Can track report by ID
- [ ] Map shows markers
- [ ] Status updates sync in real-time
- [ ] Team assignment works

## 🚀 Deployment

### Before Going Live

1. **Set up proper authentication** (optional but recommended)
2. **Enable CORS** for your domain
3. **Configure security rules** for production
4. **Set up Firebase backups**
5. **Monitor quota usage**
6. **Set up error logging**
7. **Configure CDN caching** for images

### Environment Variables for Production

```
VITE_FIREBASE_API_KEY=prod_key
VITE_FIREBASE_AUTH_DOMAIN=prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=prod_project
VITE_FIREBASE_STORAGE_BUCKET=prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=prod_id
VITE_FIREBASE_APP_ID=prod_app_id
```

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Storage Guide](https://firebase.google.com/docs/storage)
- [React Firebase Hooks](https://react-firebase-hooks.web.app/)

## ❓ FAQ

**Q: Where are my reports stored?**
A: In Firestore under the `complaints` collection.

**Q: Where are the images stored?**
A: In Firebase Storage under `complaints/` directory.

**Q: How do I backup my data?**
A: Use Firestore automated backups in Google Cloud Console.

**Q: Can I use this without Firebase?**
A: Yes, modify the service files to use your own backend API.

**Q: How much does Firebase cost?**
A: Free tier includes 50,000 reads/writes per day.

## 📞 Support

For issues:

1. Check `.env.local` has correct values
2. Verify Firestore/Storage are enabled
3. Check security rules in Firebase Console
4. Look for errors in browser console
5. Review Firebase Console for quota issues

---

**Last Updated**: March 2026
**Status**: Ready for Development
