const admin = require('firebase-admin');

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin initialized with service account.");
  } else {
    // Attempt default initialization (works on GCP/Firebase environments or if GOOGLE_APPLICATION_CREDENTIALS is set)
    admin.initializeApp();
    console.log("Firebase Admin initialized with default credentials.");
  }
} catch (error) {
  console.error("Firebase Admin initialization error:", error.message);
  // Do not crash the server if initialization fails, just log it.
}

const auth = admin.auth();

module.exports = { admin, auth };
