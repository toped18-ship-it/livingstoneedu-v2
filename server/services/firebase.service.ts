import fs from 'fs';
import { getFirebaseDatabase, isStandaloneMode } from '../config/firebase';
import { ENV } from '../config/env';
import { AppDB, AppConfig, Activity, Inquiry } from '../types';
import { Logger } from '../utils/logger';

const DEFAULT_DB: AppDB = {
  config: {
    brandName: 'LIVINGSTONEEDU',
    appSubtitle: 'Learning Portal',
    proPrice: '₦5,000',
    supportGroupUrl: 'https://wa.me/message/AJ4NILOGBTTMJ1',
    contactName: 'Livingtch Brand Agency',
    logoIcon: 'GraduationCap',
    logoColor: 'blue',
    logoText: 'LIVINGSTONE',
    activeGateway: 'Paystack',
    isPaymentLive: false,
    paystackPublicKey: 'pk_test_paystack_a1b2c3d4e5f6',
    flutterwavePublicKey: 'FLWPUBK_TEST-a1b2c3d4e5',
    stripePublicKey: 'pk_test_stripe_12345',
    paystackLink: 'https://paystack.com/pay/livingstone-pro-access',
    flutterwaveLink: 'https://flutterwave.com/pay/sxagj005oznw'
  },
  activities: [
    {
      id: 'act_1',
      userName: 'Mrs. Funke Alao',
      userEmail: 'funke@livingstone.ng',
      activityType: 'Login',
      subject: 'General',
      detail: 'Teacher Funke Alao logged in to primary dashboard',
      timestamp: new Date().toISOString()
    },
    {
      id: 'act_2',
      userName: 'Mrs. Funke Alao',
      userEmail: 'funke@livingstone.ng',
      activityType: 'Lesson Open',
      subject: 'Mathematics',
      detail: 'Viewed lesson Week 1 Mathematics: Whole Numbers',
      timestamp: new Date().toISOString()
    }
  ],
  inquiries: [
    {
      id: 'inq_1592',
      name: 'Olumide Benson',
      email: 'benson@gmail.com',
      subject: 'JSS 2 Syllabus Question',
      message: 'Hello, please can we print out the complete worksheets for offline classes in Ibadan?',
      timestamp: new Date().toISOString(),
      replyStatus: 'Pending'
    }
  ]
};

export class FirebaseService {
  private static localCache: AppDB | null = null;

  private static loadLocalBackup(): AppDB {
    try {
      if (!fs.existsSync(ENV.DB_PATH)) {
        fs.writeFileSync(ENV.DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
        return DEFAULT_DB;
      }
      const data = fs.readFileSync(ENV.DB_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (err: any) {
      Logger.warn('FirebaseService', `FS DB load fallback triggered: ${err.message}`);
      return DEFAULT_DB;
    }
  }

  private static saveLocalBackup(db: AppDB): void {
    try {
      fs.writeFileSync(ENV.DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    } catch (err: any) {
      Logger.error('FirebaseService', 'Failed to commit backup DB to disk', err);
    }
  }

  static async getDB(): Promise<AppDB> {
    if (this.localCache) {
      return this.localCache;
    }

    const backup = this.loadLocalBackup();
    
    if (isStandaloneMode()) {
      Logger.info('FirebaseService', 'Firebase in standalone mode. Serving local database.');
      this.localCache = backup;
      return backup;
    }

    try {
      const rtdb = getFirebaseDatabase();
      if (!rtdb) throw new Error('Firebase Database connection unavailable.');

      Logger.firebaseCall('READ_ALL', 'root', true);
      
      const configSnapshot = await rtdb.ref('school_settings').get();
      const activitiesSnapshot = await rtdb.ref('activities').get();
      const inquiriesSnapshot = await rtdb.ref('inquiries').get();
      const geminiApiKeySnapshot = await rtdb.ref('geminiApiKey').get();

      const config: AppConfig = configSnapshot.exists() 
        ? configSnapshot.val() 
        : backup.config;
      
      // Inject geminiApiKey if stored separately in RTDB
      if (geminiApiKeySnapshot.exists()) {
        config.geminiApiKey = geminiApiKeySnapshot.val();
      } else if ((backup.config as any).geminiApiKey) {
        config.geminiApiKey = (backup.config as any).geminiApiKey;
      }

      // Safeguard arrays
      let activities: Activity[] = [];
      if (activitiesSnapshot.exists()) {
        const val = activitiesSnapshot.val();
        activities = Array.isArray(val) ? val : Object.values(val);
      } else {
        activities = backup.activities;
      }

      let inquiries: Inquiry[] = [];
      if (inquiriesSnapshot.exists()) {
        const val = inquiriesSnapshot.val();
        inquiries = Array.isArray(val) ? val : Object.values(val);
      } else {
        inquiries = backup.inquiries;
      }

      const mergedDB: AppDB = { config, activities, inquiries };
      this.localCache = mergedDB;
      this.saveLocalBackup(mergedDB);
      
      return mergedDB;
    } catch (error: any) {
      Logger.error('FirebaseService', 'Firebase getDB call failed, falling back to local DB', error);
      this.localCache = backup;
      return backup;
    }
  }

  static async saveDB(db: AppDB): Promise<void> {
    this.localCache = db;
    this.saveLocalBackup(db);

    if (isStandaloneMode()) {
      return;
    }

    try {
      const rtdb = getFirebaseDatabase();
      if (!rtdb) throw new Error('Firebase Database connection unavailable.');

      Logger.firebaseCall('WRITE_CONFIG', 'school_settings', true);
      await rtdb.ref('school_settings').set(db.config);
      
      Logger.firebaseCall('WRITE_ACTIVITIES', 'activities', true);
      await rtdb.ref('activities').set(db.activities);

      Logger.firebaseCall('WRITE_INQUIRIES', 'inquiries', true);
      await rtdb.ref('inquiries').set(db.inquiries);

      if (db.config.geminiApiKey) {
        await rtdb.ref('geminiApiKey').set(db.config.geminiApiKey);
      }
    } catch (error: any) {
      Logger.error('FirebaseService', 'Firebase saveDB call failed', error);
    }
  }

  static async getConfig(): Promise<AppConfig> {
    const db = await this.getDB();
    return db.config;
  }

  static async updateConfig(newConfig: Partial<AppConfig>): Promise<AppConfig> {
    const db = await this.getDB();
    db.config = { ...db.config, ...newConfig };
    await this.saveDB(db);
    return db.config;
  }

  static async getActivities(): Promise<Activity[]> {
    const db = await this.getDB();
    return db.activities;
  }

  static async logActivity(activity: Partial<Activity>): Promise<Activity> {
    const db = await this.getDB();
    const newActivity: Activity = {
      id: activity.id || 'act_' + Date.now().toString() + '_' + Math.floor(Math.random() * 1000),
      userName: activity.userName || 'Anonymous User',
      userEmail: activity.userEmail || 'anonymous@gmail.com',
      activityType: activity.activityType || 'Activity',
      subject: activity.subject || 'General',
      detail: activity.detail || 'Active on lesson portals',
      timestamp: activity.timestamp || new Date().toISOString()
    };

    db.activities.unshift(newActivity);
    if (db.activities.length > 250) {
      db.activities = db.activities.slice(0, 150);
    }

    await this.saveDB(db);
    return newActivity;
  }

  static async clearActivities(): Promise<void> {
    const db = await this.getDB();
    db.activities = [];
    await this.saveDB(db);
  }

  static async getInquiries(): Promise<Inquiry[]> {
    const db = await this.getDB();
    return db.inquiries;
  }

  static async addInquiry(inquiry: Partial<Inquiry>): Promise<Inquiry> {
    const db = await this.getDB();
    const newInquiry: Inquiry = {
      id: inquiry.id || 'inq_' + Date.now().toString(),
      name: inquiry.name || 'Inquirer',
      email: inquiry.email || 'unknown@domain.com',
      subject: inquiry.subject || 'Curriculum Inquiry',
      message: inquiry.message || '',
      timestamp: inquiry.timestamp || new Date().toISOString(),
      replyStatus: 'Pending'
    };

    db.inquiries.unshift(newInquiry);
    await this.saveDB(db);
    return newInquiry;
  }

  static async replyInquiry(id: string): Promise<boolean> {
    const db = await this.getDB();
    const inq = db.inquiries.find(i => i.id === id);
    if (inq) {
      inq.replyStatus = 'Replied';
      await this.saveDB(db);
      return true;
    }
    return false;
  }

  static async getCurriculum(subject: string, classLevel: string, term: string): Promise<any[]> {
    if (isStandaloneMode()) {
      return [];
    }

    try {
      const rtdb = getFirebaseDatabase();
      if (!rtdb) return [];

      const snapshot = await rtdb.ref('curriculum').get();
      if (!snapshot.exists()) return [];

      const rtdbCurriculum = snapshot.val();
      
      const getFlatCurriculums = (obj: any): any[] => {
        if (!obj || typeof obj !== 'object') return [];
        if (obj.topic !== undefined && (obj.class !== undefined || obj.week !== undefined)) {
          return [obj];
        }
        let list: any[] = [];
        for (const val of Object.values(obj)) {
          list = list.concat(getFlatCurriculums(val));
        }
        return list;
      };

      const flatList = getFlatCurriculums(rtdbCurriculum);
      const norm = (s: string) => String(s).replace(/\s+/g, '').toLowerCase();

      return flatList.filter((record: any) => {
        if (!record) return false;
        return norm(record.class) === norm(classLevel) &&
               norm(record.subject) === norm(subject) &&
               norm(record.term) === norm(term);
      });
    } catch (error) {
      Logger.error('FirebaseService', `Failed to get curriculum for ${subject} - ${classLevel}`, error);
      return [];
    }
  }

  static async getStoredTopic(subject: string, classLevel: string, term: string, week: string): Promise<string | null> {
    const list = await this.getCurriculum(subject, classLevel, term);
    if (list.length === 0) return null;

    const normWeek = (w: any) => {
      if (typeof w === 'number') return w;
      const m = String(w).match(/\d+/);
      return m ? parseInt(m[0], 10) : null;
    };

    const targetWeekNum = normWeek(week);
    if (!targetWeekNum) return null;

    const matched = list.find((record: any) => normWeek(record.week) === targetWeekNum);
    return matched ? matched.topic : null;
  }
}
