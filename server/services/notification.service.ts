import { getFirebaseFirestore, getFirebaseMessaging, isStandaloneMode } from '../config/firebase';
import { Logger } from '../utils/logger';

export class NotificationService {
  static async sendMulticastPush(title: string, body: string): Promise<{
    success: boolean;
    simulated: boolean;
    successCount?: number;
    failureCount?: number;
    totalSubscribers: number;
    message: string;
  }> {
    if (isStandaloneMode()) {
      Logger.info('NotificationService', `[Simulated Push Alert] Title: "${title}" | Body: "${body}"`);
      return {
        success: true,
        simulated: true,
        totalSubscribers: 0,
        message: 'No active Firebase Service account registered. Saved alert simulation executed.'
      };
    }

    try {
      const dbStore = getFirebaseFirestore();
      const messaging = getFirebaseMessaging();
      
      if (!dbStore || !messaging) {
        throw new Error('Firebase Firestore or Cloud Messaging services are unavailable.');
      }

      const subsSnapshot = await dbStore.collection('pushSubscriptions').get();
      const tokens: string[] = [];
      
      subsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data && data.token && !data.token.startsWith('fcm_token_livingstone_')) {
          tokens.push(data.token);
        }
      });

      Logger.info('NotificationService', `Attempting to dispatch alert to ${subsSnapshot.size} total subscribers.`);

      if (tokens.length === 0) {
        return {
          success: true,
          simulated: true,
          totalSubscribers: subsSnapshot.size,
          message: 'Alert synced. No external physical client tokens were active for remote dispatch, simulation completed.'
        };
      }

      // Execute standard multicast messaging API
      const messagingResult = await messaging.sendEachForMulticast({
        tokens,
        notification: {
          title,
          body
        }
      });

      Logger.info('NotificationService', `Multicast sent successfully. Success: ${messagingResult.successCount}, Failures: ${messagingResult.failureCount}`);

      return {
        success: true,
        simulated: false,
        successCount: messagingResult.successCount,
        failureCount: messagingResult.failureCount,
        totalSubscribers: subsSnapshot.size,
        message: 'Successfully broadcasted notification alert to physical devices.'
      };
    } catch (error: any) {
      Logger.error('NotificationService', 'Push notification multicast broadcast failed', error);
      throw error;
    }
  }
}
