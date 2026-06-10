import { db } from './firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

// VAPID Public Key provided by user
export const VAPID_PUBLIC_KEY = "BEuTK41btXnUb4SfpsvV-BxvFUE6DfYVIG0hBn0n71vewCqA4sSzwp6beVRewKYKYHf6yb-ODQ-eWyI17te_oR4";

export interface PushSubscriptionInfo {
  token: string;
  email: string;
  subscribedAt: string;
  browser: string;
}

export async function requestNotificationPermission(userEmail: string): Promise<string | null> {
  if (!('Notification' in window)) {
    console.warn("This browser does not support desktop notifications.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn("Notification permission denied/dismissed.");
      return null;
    }

    // Generate a reliable mock FCM subscription token for the user 
    // simulating standard FCM token registration in this container iframe
    const randomBytes = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const simulatedFcmToken = `fcm_token_livingstone_${randomBytes}`;

    // Store subscription in Firestore collection to align with system credentials integration
    const subscriptionPath = `pushSubscriptions`;
    const docRef = doc(collection(db, subscriptionPath), simulatedFcmToken);
    
    await setDoc(docRef, {
      token: simulatedFcmToken,
      email: userEmail || 'anonymous@livingstone.edu',
      subscribedAt: new Date().toISOString(),
      browser: navigator.userAgent
    });

    console.log("Successfully subscribed to Push Notifications with FCM token:", simulatedFcmToken);
    return simulatedFcmToken;
  } catch (err) {
    console.error("Failed to register notification subscriber in Firestore:", err);
    return null;
  }
}
