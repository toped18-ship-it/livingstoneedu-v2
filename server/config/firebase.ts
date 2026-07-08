import * as admin from 'firebase-admin';
import { initializeApp as initAdminApp, cert as adminCert, getApps as getAdminApps, getApp as getAdminApp } from 'firebase-admin/app';
import { getDatabase as getAdminDatabase } from 'firebase-admin/database';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { getMessaging as getAdminMessaging } from 'firebase-admin/messaging';
import fs from 'fs';
import { ENV } from './env';

let firebaseAdminApp: admin.App | null = null;
let isStandAlone = false;

export function getFirebaseAdminApp(): admin.App | null {
  if (firebaseAdminApp) return firebaseAdminApp;

  try {
    if (fs.existsSync(ENV.SERVICE_ACCOUNT_PATH)) {
      const serviceAccount = JSON.parse(fs.readFileSync(ENV.SERVICE_ACCOUNT_PATH, 'utf8'));
      
      let dbUrl = "https://livingstoneedu-17aad-default-rtdb.firebaseio.com";
      try {
        if (fs.existsSync(ENV.APPLET_CONFIG_PATH)) {
          const configDetails = JSON.parse(fs.readFileSync(ENV.APPLET_CONFIG_PATH, 'utf8'));
          if (configDetails.databaseURL) {
            dbUrl = configDetails.databaseURL;
          }
        }
      } catch (errConfig: any) {
        console.warn("[Firebase Admin] Failed reading firebase-applet-config.json for databaseURL:", errConfig.message || errConfig);
      }

      const activeApps = getAdminApps();
      
      if (activeApps.length === 0) {
        firebaseAdminApp = initAdminApp({
          credential: adminCert(serviceAccount),
          databaseURL: dbUrl
        });
      } else {
        firebaseAdminApp = getAdminApp();
      }
      
      console.log(`[Firebase Admin] Instantiated successfully. DatabaseURL: ${dbUrl}`);

      // Verify token
      firebaseAdminApp.options.credential?.getAccessToken()
        .then(() => {
          console.log("[Firebase Admin] Service Account credentials successfully verified.");
        })
        .catch((authErr: any) => {
          console.warn("[Firebase Admin Warning] Service account credentials could not be verified (likely revoked/stale):", authErr.message || authErr);
          console.warn("[Firebase Admin] Reverting to standalone/simulated database mode.");
          firebaseAdminApp = null;
          isStandAlone = true;
        });
    } else {
      console.warn("[Firebase Admin] No service account key found. Standalone mode is active.");
      isStandAlone = true;
    }
  } catch (error: any) {
    console.error("[Firebase Admin Error] Initialization failed:", error.message || error);
    isStandAlone = true;
  }

  return firebaseAdminApp;
}

export function isStandaloneMode(): boolean {
  if (firebaseAdminApp === null && !isStandAlone) {
    getFirebaseAdminApp();
  }
  return firebaseAdminApp === null;
}

export function getFirebaseDatabase() {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  return getAdminDatabase(app);
}

export function getFirebaseFirestore() {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  return getAdminFirestore(app);
}

export function getFirebaseMessaging() {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  return getAdminMessaging(app);
}
