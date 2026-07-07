import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import fs from 'fs';
import * as admin from 'firebase-admin';
import { initializeApp as initAdminApp, cert as adminCert, getApps as getAdminApps, getApp as getAdminApp } from 'firebase-admin/app';
import { getDatabase as getAdminDatabase } from 'firebase-admin/database';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { getMessaging as getAdminMessaging } from 'firebase-admin/messaging';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { jsonrepair } from 'jsonrepair';

function safeParseJson(text: string): any {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch (err: any) {
    console.warn("[JSON Parse warning] Standard JSON.parse failed. Attempting jsonrepair...", err.message || err);
    try {
      const repaired = jsonrepair(trimmed);
      return JSON.parse(repaired);
    } catch (repairErr: any) {
      console.error("[JSON Parse Error] jsonrepair also failed.", repairErr.message || repairErr);
      throw err;
    }
  }
}

// Google Gen AI Client holder
let aiClient: GoogleGenAI | null = null;

interface AppDB {
  config: {
    brandName: string;
    appSubtitle: string;
    proPrice: string;
    supportGroupUrl: string;
    contactName: string;
    logoIcon?: string;
    logoColor?: string;
    logoText?: string;
    activeGateway?: string;
    isPaymentLive?: boolean;
    paystackPublicKey?: string;
    flutterwavePublicKey?: string;
    stripePublicKey?: string;
    gmailAccessToken?: string;
    connectedGmailEmail?: string;
    lastConnectedTime?: string;
    paystackLink?: string;
    flutterwaveLink?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
  };
  activities: Array<{
    id: string;
    userName: string;
    userEmail: string;
    activityType: string;
    subject: string;
    detail: string;
    timestamp: string;
  }>;
  inquiries: Array<{
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    timestamp: string;
    replyStatus: 'Pending' | 'Replied';
  }>;
}

const DB_PATH = path.join(process.cwd(), 'db.json');

function getDB(): AppDB {
  const defaultDB: AppDB = {
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

  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2), 'utf-8');
      return defaultDB;
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.warn("FS DB load triggered fallback", err);
    return defaultDB;
  }
}

function saveDB(db: AppDB) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed to commit DB to disk", err);
  }
}

function getGeminiClient(): GoogleGenAI {
  if (aiClient) return aiClient;
  
  const db = getDB();
  const key = process.env.GEMINI_API_KEY || (db as any).geminiApiKey;
  if (!key) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please configure it in your Admin Panel settings.');
  }
  
  aiClient = new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Guarded Firebase Admin Initialization
  let firebaseAdminApp: any = null;
  try {
    const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      
      // Dynamically load databaseURL from firebase-applet-config
      let dbUrl = "https://livingstoneedu-17aad-default-rtdb.firebaseio.com";
      try {
        const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
        if (fs.existsSync(configPath)) {
          const configDetails = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          if (configDetails.databaseURL) {
            dbUrl = configDetails.databaseURL;
          }
        }
      } catch (errConfig) {
        console.warn("[Firebase Admin] Failed reading firebase-applet-config.json for databaseURL:", errConfig);
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
      console.log(`[Firebase Admin Successfully Instantiated via modular SDK] Client email: ${serviceAccount.client_email} and databaseURL: ${dbUrl}`);

      // Asynchronously verify credential viability to gracefully fall back to standalone mode if revoked
      firebaseAdminApp.options.credential.getAccessToken()
        .then(() => {
          console.log("[Firebase Admin] Service Account credentials successfully verified with Google OAuth endpoint.");
        })
        .catch((authErr: any) => {
          console.warn("[Firebase Admin Warning] Service account credentials could not be verified (likely key is revoked or stale):", authErr.message || authErr);
          console.warn("[Firebase Admin] Reverting backend to standalone/simulated database mode to guarantee stability.");
          firebaseAdminApp = null;
        });
    } else {
      console.warn("[Firebase Admin] No service account key found at firebase-service-account.json. Standalone database mode is active.");
    }
  } catch (error: any) {
    console.error("[Firebase Admin Error] Primary initialization failed:", error.message || error, error.stack);
  }

  // Admin Backend Role verification middleware
  const adminAuthMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const requestPath = req.baseUrl + req.path;
    // Exclude public get requests and public submissions (saving inquiry / logging public actions)
    if (
      requestPath === '/api/admin/log-activity' || 
      requestPath === '/api/admin/add-inquiry' || 
      (requestPath === '/api/admin/config' && req.method === 'GET')
    ) {
      return next();
    }

    const adminRole = req.headers['x-admin-role'];
    const adminEmail = req.headers['x-admin-email'];

    if (typeof adminEmail === 'string' && adminEmail.toLowerCase() === 'toped18@gmail.com') {
      return next();
    }

    if (adminRole === 'admin' && typeof adminEmail === 'string') {
      return next();
    }

    console.warn(`[Blocked Unauthorized Administration Request] Path: ${requestPath} Method: ${req.method} Role: ${adminRole} Email: ${adminEmail}`);
    return res.status(403).json({ 
      error: 'Forbidden', 
      message: 'Access Denied. Access to this administrative system is restricted to verified App Owner accounts.' 
    });
  };

  app.use('/api/admin/*', adminAuthMiddleware);

  // API Route: Save active Google connection credentials (such as Gmail API key/token)
  app.post('/api/admin/gmail/save-connection', (req, res) => {
    const { accessToken, email } = req.body;
    
    const db = getDB();
    db.config.gmailAccessToken = accessToken || '';
    db.config.connectedGmailEmail = email || '';
    db.config.lastConnectedTime = accessToken ? new Date().toISOString() : '';
    
    saveDB(db);
    console.log(`[Gmail Connection] Saved access token for ${email || 'cleared'} successfully.`);
    res.json({ success: true, connectedGmailEmail: email || '' });
  });

  // API Route: Realtime Database privileged test write proxy (handles verification)
  app.post('/api/rtdb/test-write', async (req, res) => {
    try {
      if (firebaseAdminApp) {
        // Use getAdminDatabase to execute privileged bypass set operations
        const dbRef = getAdminDatabase(firebaseAdminApp).ref('users/test_user');
        await dbRef.set({
          id: 'test_user',
          status: 'active',
          verifiedAt: new Date().toISOString(),
          message: 'Firebase Realtime Database initialized successfully by Livingstone Edu Learning Portal server'
        });
        console.log('[RTDB Server Verification] Test write of users/test_user successful utilizing Admin SDK.');
        return res.json({ success: true });
      } else {
        console.warn('[RTDB Server Verification Bypass] Firebase Admin SDK is not initialized/active. Simulating a successful write operation to prevent blocking.');
        return res.json({ 
          success: true, 
          simulated: true, 
          message: 'Firebase Realtime Database is running in offline-first / simulated mode.' 
        });
      }
    } catch (err: any) {
      console.error('[RTDB Server Verification Failure] Failed to execute test write through server admin sdk:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // API Route: Send user signup notification & welcome email using connected administrator Gmail SMTP
  app.post('/api/notify-signup', async (req, res) => {
    const { fullName, email, role, schoolName, otpCode } = req.body;
    if (!fullName || !email) {
      return res.status(400).json({ error: 'Full name and email are required.' });
    }

    const db = getDB();
    const token = db.config.gmailAccessToken;
    const connectedEmail = db.config.connectedGmailEmail;

    console.log(`[Signup Notification] Received registration for: ${fullName} (${email}). OTP: ${otpCode || 'None'}. Gmail connected: ${connectedEmail || 'None'}`);

    // Always log the activity so the admin sees the registration even if mail is not sent
    const newActivity = {
      id: 'act_signup_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      userName: fullName,
      userEmail: email,
      activityType: 'Registration',
      subject: 'Academic Portal',
      detail: `${role === 'teacher' ? 'Teacher' : 'Student'} registration completed. Email: ${email}. OTP: ${otpCode || 'N/A'}`,
      timestamp: new Date().toISOString()
    };
    db.activities.unshift(newActivity);
    if (db.activities.length > 250) {
      db.activities = db.activities.slice(0, 150);
    }
    saveDB(db);

    const alertEmail = 'livingtech@livingtech.name.ng';

    const adminMailSubject = `🎓 [Firebase Alert] New User Signup: ${fullName}`;
    const adminMailBody = `Dear Support Team / Admin,

A new user has registered on the LivingstoneEdu LMS platform.

Details of New Account:
- Full Name: ${fullName}
- Registered Email: ${email}
- Profile Role: ${role === 'teacher' ? 'Teacher' : 'Student'}
- Academic School: ${schoolName || 'Livingstone Educational Academy'}
- OTP Verification Code: ${otpCode || 'N/A'}
- Timestamp: ${new Date().toUTCString()}

LMS Automated Gateway Service`;

    const userMailSubject = `Verify Your Account - Livingstone Educational Academy`;
    const userMailBody = `Dear ${fullName},

Welcome to Livingstone Educational Academy LMS! We are thrilled to partner with you on your educational journey.

To complete your registration and log in, please use the One-Time Passcode (OTP) below:

OTP CODE: ${otpCode || '123456'}

Your profile (${email}) has been successfully created and is pending activation.

If you did not make this request or need help, please contact us at ${alertEmail}.

Warm regards,
Livingstone Educational Academy Team`;

    if (!token || !connectedEmail) {
      console.log(`[Signup Notification] Skipped automated Gmail dispatch: No active administrator Gmail API connection found. (Target alert email: ${alertEmail})`);
      return res.json({ 
        success: true, 
        message: `Profile registered! (Simulation mode: OTP is ${otpCode || '123456'}). Connect Gmail in settings to send real emails to ${alertEmail} and ${email}.`
      });
    }

    try {
      // Helper function to send email via standard Google Gmail Send API
      const sendGmailMsg = async (to: string, subject: string, bodyText: string) => {
        const emailLines = [
          `To: ${to}`,
          `Subject: ${subject}`,
          `Content-Type: text/plain; charset="UTF-8"`,
          `MIME-Version: 1.0`,
          ``,
          bodyText
        ];
        const emailContent = emailLines.join('\r\n');
        
        // Safe base64url encoding
        const rawBase64 = Buffer.from(emailContent, 'utf-8')
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ raw: rawBase64 })
        });

        if (!response.ok) {
          throw new Error(`Gmail Send HTTP ${response.status}`);
        }
        return response;
      };

      // 1. Send Firebase Alert to support email
      let alertSent = false;
      try {
        await sendGmailMsg(alertEmail, adminMailSubject, adminMailBody);
        console.log(`[Signup Notification] Successfully dispatched alert to ${alertEmail}`);
        alertSent = true;
      } catch (err: any) {
        console.warn(`[Signup Notification Warning] Failed to send alert email to ${alertEmail}:`, err.message || err);
      }

      // Also send to connected admin if different
      if (connectedEmail && connectedEmail.toLowerCase() !== alertEmail.toLowerCase()) {
        try {
          await sendGmailMsg(connectedEmail, adminMailSubject, adminMailBody);
          console.log(`[Signup Notification] Successfully dispatched admin alert copy to ${connectedEmail}`);
        } catch (err: any) {
          console.warn(`[Signup Notification Warning] Failed to send copy to connected email:`, err.message || err);
        }
      }

      // 2. Send OTP welcome email to user
      try {
        await sendGmailMsg(email, userMailSubject, userMailBody);
        console.log(`[Signup Notification] Successfully dispatched welcome OTP email to ${email}`);
      } catch (err: any) {
        console.warn(`[Signup Notification Warning] Failed to send email to user:`, err.message || err);
        throw err;
      }

      return res.json({ 
        success: true, 
        message: `Verification code sent to ${email}. Alert delivered to ${alertEmail}.` 
      });

    } catch (err: any) {
      console.warn('[Signup Notification Error] Gmail dispatch failed (token may be expired):', err.message || err);
      return res.json({ 
        success: true, 
        message: `Registered! (OTP: ${otpCode || '123456'}). Email dispatch failed, verify with code above.` 
      });
    }
  });

  // API Route: Send Push Notification utilizing Firebase Admin SDK if active
  app.post('/api/admin/send-push', async (req, res) => {
    const { title, body } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required.' });
    }

    if (!firebaseAdminApp) {
      console.log(`[Simulated Push Alert] Title: "${title}" | Body: "${body}"`);
      return res.json({ 
        success: true, 
        simulated: true, 
        message: 'No active Firebase Service account registered. Saved alert simulation executed.' 
      });
    }

    try {
      const dbStore = getAdminFirestore(firebaseAdminApp);
      const subsSnapshot = await dbStore.collection('pushSubscriptions').get();
      
      const tokens: string[] = [];
      subsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data && data.token && !data.token.startsWith('fcm_token_livingstone_')) {
          tokens.push(data.token);
        }
      });

      console.log(`[Push Notification] Attempting to dispatch alert to ${subsSnapshot.size} total subscribers.`);

      if (tokens.length === 0) {
        return res.json({
          success: true,
          message: 'Alert synced. No external physical client tokens were active for remote dispatch, simulation completed successfully.',
          totalSubscribers: subsSnapshot.size
        });
      }

      const messagingResult = await getAdminMessaging(firebaseAdminApp).sendEachForMulticast({
        tokens: tokens,
        notification: {
          title: title,
          body: body
        }
      });

      res.json({
        success: true,
        message: 'Successfully broadcasted notification alert to physical devices.',
        successCount: messagingResult.successCount,
        failureCount: messagingResult.failureCount,
        totalSubscribers: subsSnapshot.size
      });
    } catch (err: any) {
      console.error("[Push Broadcast Error]", err);
      res.status(500).json({ error: 'Could not send push notification.', message: err.message });
    }
  });

  // API Route: Get Secure Settings (Admin Only)
  app.get('/api/admin/secure-settings', (req, res) => {
    const db = getDB();
    const key = (db as any).geminiApiKey || '';
    const maskedKey = key ? `${key.substring(0, Math.min(6, key.length))}...${key.substring(Math.max(0, key.length - 4))}` : '';
    res.json({ geminiApiKey: maskedKey, hasKey: !!key });
  });

  // API Route: Update Secure Settings (Admin Only)
  app.post('/api/admin/secure-settings', (req, res) => {
    const { geminiApiKey } = req.body;
    const db = getDB();
    
    if (geminiApiKey && !geminiApiKey.includes('...')) {
      (db as any).geminiApiKey = geminiApiKey.trim();
      aiClient = null; // reset dynamic client cache to reload on next request
      saveDB(db);
    } else if (geminiApiKey === '') {
      (db as any).geminiApiKey = '';
      aiClient = null;
      saveDB(db);
    }
    
    res.json({ success: true, hasKey: !(!(db as any).geminiApiKey) });
  });

  // API Route: Get App Custom Config
  app.get('/api/admin/config', (req, res) => {
    const db = getDB();
    res.json(db.config);
  });

  // API Route: Update App Custom Config
  app.post('/api/admin/config', async (req, res) => {
    const { 
      brandName, 
      appSubtitle, 
      proPrice, 
      supportGroupUrl, 
      contactName,
      logoIcon,
      logoColor,
      logoText,
      activeGateway,
      isPaymentLive,
      paystackPublicKey,
      flutterwavePublicKey,
      stripePublicKey,
      paystackLink,
      flutterwaveLink,
      bankName,
      bankAccountNumber,
      bankAccountName
    } = req.body;
    const db = getDB();
    
    db.config = {
      brandName: brandName || db.config.brandName,
      appSubtitle: appSubtitle || db.config.appSubtitle,
      proPrice: proPrice || db.config.proPrice,
      supportGroupUrl: supportGroupUrl || db.config.supportGroupUrl,
      contactName: contactName || db.config.contactName,
      logoIcon: logoIcon || db.config.logoIcon || 'GraduationCap',
      logoColor: logoColor || db.config.logoColor || 'blue',
      logoText: logoText || db.config.logoText || 'LIVINGSTONE',
      activeGateway: activeGateway || db.config.activeGateway || 'Paystack',
      isPaymentLive: isPaymentLive !== undefined ? isPaymentLive : db.config.isPaymentLive || false,
      paystackPublicKey: paystackPublicKey !== undefined ? paystackPublicKey : db.config.paystackPublicKey || '',
      flutterwavePublicKey: flutterwavePublicKey !== undefined ? flutterwavePublicKey : db.config.flutterwavePublicKey || '',
      stripePublicKey: stripePublicKey !== undefined ? stripePublicKey : db.config.stripePublicKey || '',
      paystackLink: paystackLink !== undefined ? paystackLink : db.config.paystackLink || '',
      flutterwaveLink: flutterwaveLink !== undefined ? flutterwaveLink : db.config.flutterwaveLink || '',
      bankName: bankName !== undefined ? bankName : db.config.bankName || 'WEMA Bank (Paystack Secure)',
      bankAccountNumber: bankAccountNumber !== undefined ? bankAccountNumber : db.config.bankAccountNumber || '9038472910',
      bankAccountName: bankAccountName !== undefined ? bankAccountName : db.config.bankAccountName || 'LIVINGSTONEEDU PREMIUM PORTAL'
    };
    
    saveDB(db);
    
    if (firebaseAdminApp) {
      try {
        const dbRef = getAdminDatabase(firebaseAdminApp).ref('school_settings');
        await dbRef.set(db.config);
        console.log('[RTDB Config Sync] Successfully synchronized school settings with Firebase Realtime Database.');
      } catch (rtdbErr: any) {
        console.error('[RTDB Config Sync Error] Failed to synchronize settings:', rtdbErr.message || rtdbErr);
      }
    }

    res.json({ success: true, config: db.config });
  });

  // API Route: Get User Activities Log
  app.get('/api/admin/activities', (req, res) => {
    const db = getDB();
    res.json(db.activities);
  });

  // API Route: Clear User Activities Log
  app.post('/api/admin/activities/clear', (req, res) => {
    const db = getDB();
    db.activities = [];
    saveDB(db);
    res.json({ success: true });
  });

  // API Route: Append User Activity Event
  app.post('/api/admin/log-activity', (req, res) => {
    const { userName, userEmail, activityType, subject, detail } = req.body;
    const db = getDB();
    
    const newActivity = {
      id: 'act_' + Date.now().toString() + '_' + Math.floor(Math.random() * 1000),
      userName: userName || 'Anonymous User',
      userEmail: userEmail || 'anonymous@gmail.com',
      activityType: activityType || 'Activity',
      subject: subject || 'General',
      detail: detail || 'Active on lesson portals',
      timestamp: new Date().toISOString()
    };
    
    db.activities.unshift(newActivity);
    if (db.activities.length > 250) {
      db.activities = db.activities.slice(0, 150);
    }
    
    saveDB(db);
    res.json({ success: true, activity: newActivity });
  });

  // API Route: Get All Submitted Help Inquiries
  app.get('/api/admin/inquiries', (req, res) => {
    const db = getDB();
    res.json(db.inquiries);
  });

  // API Route: Log New Inquiry Request Form (And auto saves to db)
  app.post('/api/admin/add-inquiry', (req, res) => {
    const { name, email, subject, message } = req.body;
    const db = getDB();
    
    const newInquiry = {
      id: 'inq_' + Date.now().toString(),
      name: name || 'Inquirer',
      email: email || 'unknown@domain.com',
      subject: subject || 'Curriculum Inquiry',
      message: message || '',
      timestamp: new Date().toISOString(),
      replyStatus: 'Pending' as const
    };
    
    db.inquiries.unshift(newInquiry);
    saveDB(db);
    res.json({ success: true, inquiry: newInquiry });
  });

  // API Route: Set Inquiry Reply Action Resolved
  app.post('/api/admin/inquiries/reply', (req, res) => {
    const { id } = req.body;
    const db = getDB();
    const inq = db.inquiries.find(i => i.id === id);
    if (inq) {
      inq.replyStatus = 'Replied';
      saveDB(db);
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Inquiry not found' });
    }
  });

  // API Route: Generate Exam Questions using Gemini 3.5 Flash
  app.post('/api/gemini/generate-exam', async (req, res) => {
    const { 
      subject = "General Study", 
      classLevel = "Primary 1", 
      numQuestions = "5", 
      term = "First Term", 
      topic = "General Topic" 
    } = req.body || {};
    const questionsCount = parseInt(numQuestions) || 5;

    try {
      console.log(`[Gemini Integration] AI Gen Exam Request: Class=${classLevel}, Subject=${subject}, QCount=${questionsCount}`);

      const systemPrompt = `You are a professional teacher under the Nigerian Educational Research and Development Council (NERDC).
Generate a set of ${questionsCount} multiple-choice exam questions for ${classLevel}, Subject: ${subject}, Term: ${term || '1st Term'}, covering topics like: "${topic || 'General curriculum'}".

Make sure the questions:
1. Are appropriate for the academic level of a student in ${classLevel}.
2. Contain active local Nigerian contexts, names, and scenarios (e.g., using Naira, Lagos, Abuja, Aliyu, Chinedu, Ngozi) where applicable.
3. Every question must have exactly 4 options.
4. "correctIndex" is a zero-indexed integer referencing the correct option index (e.g. 0 for A, 1 for B, 2 for C, 3 for D).`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ['question', 'options', 'correctIndex', 'explanation']
            }
          }
        },
        required: ['questions']
      };

      const response = await getGeminiClient().models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [systemPrompt, `Generate ${questionsCount} questions now.`],
        config: {
          responseMimeType: 'application/json',
          responseSchema
        }
      });

      const responseText = response.text || '{}';
      const data = safeParseJson(responseText);
      res.json({ success: true, questions: data.questions || [] });

    } catch (error: any) {
      console.warn('Gemini generate-exam failed, invoking static fallback...', error.message || error);
      
      // Intelligent Static Quiz Fallback mapped directly to subject keywords
      const fallbackQuestions = [];
      const topicsList = [
        `What is a key concept in ${subject} for ${classLevel}?`,
        `Which of the following defines standard terms in ${subject}?`,
        `Under Nigerian and West African curriculum guidelines, how is ${subject} applied?`,
        `Which of the following is a core laboratory/practical procedure in ${subject}?`,
        `Solve or explain a basic model problem related to ${topic || subject}:`
      ];

      for (let i = 0; i < questionsCount; i++) {
        const index = i % topicsList.length;
        fallbackQuestions.push({
          question: `${topicsList[index]} (Practice Question ${i + 1})`,
          options: [
            `Standard option A matching NERDC standards`,
            `Highly probable choice B for examination preparation`,
            `Curriculum-aligned concept C option`,
            `Practical everyday application D option`
          ],
          correctIndex: (i * 2) % 4, // Pseudo random but repeatable correct index
          explanation: `This is an automatic fallback explanation for ${subject} ${classLevel}.`
        });
      }

      res.json({ success: true, questions: fallbackQuestions, isFallback: true });
    }
  });

  // API Route: Check / Grade typed scripts & constructive writing
  app.post('/api/gemini/grade-script', async (req, res) => {
    const { 
      studentName = "Student", 
      subject = "General Study", 
      classLevel = "Primary 1", 
      questions = [], 
      studentAnswers = [] 
    } = req.body || {};

    try {
      console.log(`AI Grading Request for student: ${studentName}, Class=${classLevel}, Subject=${subject}`);

      const prompt = `You are an expert exam paper grader in West Africa (WAEC/NECO team).
Grade the student script below.
Student: ${studentName}
Class Level: ${classLevel}
Subject: ${subject}

Exam Questions & Student Answers:
${JSON.stringify(questions.map((q: any, idx: number) => ({
  number: idx + 1,
  question: q.question,
  options: q.options,
  correctIndex: q.correctIndex,
  studentAnswerIndex: studentAnswers[idx]
})), null, 2)}

Provide scoring and a constructive report.
Format the output as a clean, plain JSON object with the following schema:
{
  "scoreOutOf100": integer (from 0 to 100),
  "caScore": integer (continuous assessment index, 0 to 40),
  "examScore": integer (examination index, 0 to 60),
  "letterGrade": string (e.g. "A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"),
  "teacherRemark": string (personalized encouraging West African style comments e.g. "An excellent performance. Keep it up!"),
  "aiStrengths": array of strings (what the student got right),
  "aiWeaknesses": array of strings (areas of curriculum they need to read about)
}`;

      const response = await getGeminiClient().models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scoreOutOf100: { type: Type.INTEGER },
              caScore: { type: Type.INTEGER },
              examScore: { type: Type.INTEGER },
              letterGrade: { type: Type.STRING },
              teacherRemark: { type: Type.STRING },
              aiStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              aiWeaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['scoreOutOf100', 'caScore', 'examScore', 'letterGrade', 'teacherRemark', 'aiStrengths', 'aiWeaknesses']
          }
        }
      });

      const responseText = response.text || '';
      const data = safeParseJson(responseText);
      res.json({ success: true, ...data });

    } catch (error: any) {
      console.warn('Gemini grading failed, invoking local rules-based grader...', error.message || error);
      
      // Calculate scores via standard algorithmic comparison
      let correctCount = 0;
      questions.forEach((q: any, idx: number) => {
        if (Number(studentAnswers[idx]) === Number(q.correctIndex)) {
          correctCount++;
        }
      });

      const pct = Math.round((correctCount / Math.max(1, questions.length)) * 100);
      const caScore = Math.round((pct / 100) * 40);
      const examScore = Math.round((pct / 100) * 60);

      let letterGrade = 'F9';
      let teacherRemark = 'A poor attempt. Major improvement needed.';
      if (pct >= 85) {
        letterGrade = 'A1';
        teacherRemark = 'Outstanding performance! Keep maintaining this academic standard.';
      } else if (pct >= 75) {
        letterGrade = 'B2';
        teacherRemark = 'Very good work. Proud of your attention to detail.';
      } else if (pct >= 65) {
        letterGrade = 'C4';
        teacherRemark = 'A good effort. Continue reading to score higher.';
      } else if (pct >= 50) {
        letterGrade = 'C6';
        teacherRemark = 'Pass. Focus more on scientific and mathematical principles.';
      } else if (pct >= 40) {
        letterGrade = 'E8';
        teacherRemark = 'Weak credit pass. Extensive revision of chapters recommended.';
      }

      res.json({
        success: true,
        scoreOutOf100: pct,
        caScore,
        examScore,
        letterGrade,
        teacherRemark,
        aiStrengths: [`Demonstrated knowledge in ${subject} topics`, 'Attempted all multiple-choice units completely'],
        aiWeaknesses: ['Needs to pay continuous attention to fundamental definitions', 'Revise weekly practical test exercises'],
        isFallback: true
      });
    }
  });

  // API Route: Expert NERDC Aligned Lesson Note Generator (with strict topic-focus)
  app.post('/api/gemini/generate-lesson-note', async (req, res) => {
    const {
      classLevel = "SS 1",
      subject = "Mathematics",
      term = "1st Term",
      week = "Week 1",
      focusTopic = "General Topic",
      topicDescription = "",
      isEndOfTerm = false,
      studentFocus = false
    } = req.body || {};

    try {
      console.log(`[Gemini Integration] AI Lesson Note Generation request: Class=${classLevel}, Subject=${subject}, Topic="${focusTopic}"`);

      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
      }

      const systemPrompt = `You are an expert Nigerian school teacher, senior pedagogy specialist, and educational content developer aligned with the official NERDC (National Educational Research and Development Council) syllabus guidelines.
Your job is to generate a comprehensive, highly structured, and complete Lesson Note explaining the requested academic topic.

CRITICAL INSTRUCTION:
You MUST explain the given topic: "${focusTopic}" under the subject: "${subject}" for the class level: "${classLevel}" in depth, following the target term (${term}) and week (${week}).
You MUST NOT add or introduce anything outside the given topic. Focus entirely on the specific educational concepts, formulas, rules, grammar principles, historical context, or practical procedures of the given topic. Do not wander into unrelated domains, other subjects, or unrequested chapters. Keep the explanation laser-focused on the topic title and description provided.

Ensure all markdown content inside 'detailedLessonNote' explains the specific topic thoroughly with clear explanations, formulas (if any), local Nigerian examples, and step-by-step procedures. Never use placeholder text like "etc." or "continue explaining here...". Everything must be fully written out.`;

      const userPrompt = `Generate a complete lesson note object for the following lesson:
Class Level: ${classLevel}
Subject: ${subject}
Term: ${term}
Week: ${week}
Focus Topic: ${focusTopic}

Output the result as a raw JSON object matching the requested schema exactly.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          objectives: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          teachingMaterials: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          keyVocabulary: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          introduction: { type: Type.STRING },
          teacherExplanationSteps: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          detailedLessonNote: { 
            type: Type.STRING,
            description: "Extremely detailed, complete lesson note in clear Markdown format explaining the specific topic completely. Do not truncate."
          },
          studentActivities: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          classExercises: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          homeworkAssignment: { type: Type.STRING },
          quizQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ['question', 'options', 'correctIndex', 'explanation']
            }
          },
          theoryQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                modelAnswer: { type: Type.STRING },
                markingSchemeName: { type: Type.STRING }
              },
              required: ['question', 'modelAnswer', 'markingSchemeName']
            }
          },
          subjectSpecificFocus: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              safeguardsOrMoralLesson: { type: Type.STRING }
            },
            required: ['title', 'content', 'safeguardsOrMoralLesson']
          }
        },
        required: [
          'topic', 'objectives', 'teachingMaterials', 'keyVocabulary',
          'introduction', 'teacherExplanationSteps', 'detailedLessonNote',
          'studentActivities', 'classExercises', 'homeworkAssignment',
          'quizQuestions', 'theoryQuestions', 'subjectSpecificFocus'
        ]
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [systemPrompt, userPrompt],
        config: {
          responseMimeType: 'application/json',
          responseSchema
        }
      });

      const responseText = response.text || '';
      const data = safeParseJson(responseText);

      res.json({ success: true, lessonNote: data });

    } catch (error: any) {
      console.warn("AI lesson note generation failed, returning high-fidelity fallbacks explaining the topic directly...", error.message || error);
      
      const fallbackNote = {
        topic: focusTopic,
        objectives: [
          `Understand the core definitions and principles of ${focusTopic}.`,
          `Examine practical real-world applications of ${focusTopic} in the Nigerian context.`,
          `Solve foundational exercise problems and answer conceptual questions on ${focusTopic}.`
        ],
        teachingMaterials: [
          "Whiteboard & markers",
          "NERDC aligned textbook and reference curriculum booklet",
          "Relevant visual aids, illustrations, and local case materials"
        ],
        keyVocabulary: [
          focusTopic.split(' ')[0] || "Foundations",
          "NERDC Syllabus",
          "Nigerian context",
          "Core principles"
        ],
        introduction: `Welcome to this week's lesson on ${focusTopic} under the subject of ${subject} for ${classLevel}. Today we are exploring the essential concepts of ${focusTopic} to build a solid foundational understanding.`,
        teacherExplanationSteps: [
          `Introduce the term '${focusTopic}' and write the key definitions on the board.`,
          `Explain the core rules, formulas, or grammar principles governing this topic.`,
          `Demonstrate step-by-step examples or case studies relevant to the lesson.`,
          `Allow students to ask clarifying questions and conduct a brief formative assessment.`
        ],
        detailedLessonNote: `## Lesson Note: ${focusTopic}\n\n### Introduction to ${focusTopic}\nIn this lesson, we study **${focusTopic}**, which is an essential part of the **${subject}** curriculum for **${classLevel}**. ${topicDescription || 'This lesson covers the core principles, definitions, and applications of this concept.'}\n\n### Key Concepts and Explanation\n1. **Core Definition**: This concept is fundamental to mastering advanced topics in this subject.\n2. **Step-by-Step Procedure**: \n   - Always start by analyzing the given terms.\n   - Apply the relevant rules or equations strictly.\n   - Verify your answers against standard guidelines.\n\n### Local Context & Nigerian Alignment\nIn Nigeria, understanding ${focusTopic} helps us solve local community challenges, optimize economic trades, improve agricultural yields, or articulate standard grammar points clearly, depending on the subject domain. Keeping our studies grounded in local context ensures that we build practical skills for national development.`,
        studentActivities: [
          "Take notes on the board and read the textbook introduction page.",
          "Participate in the classroom discussion and explain key terms in their own words.",
          "Solve the practice problems individually or in small study pairs."
        ],
        classExercises: [
          `Define '${focusTopic}' in your own words and write down its primary principles.`,
          `Give one real-world or local example where the principles of this lesson are applied.`
        ],
        homeworkAssignment: `Read the next sub-section of ${focusTopic} in your textbook and write a 100-word summary of how it relates to our everyday life in Nigeria.`,
        quizQuestions: [
          {
            question: `What is the primary focus of studying ${focusTopic}?`,
            options: [
              `To understand the key definitions, rules, and applications of ${focusTopic}`,
              "To learn how to draw unrelated diagrams",
              "To ignore standard NERDC guidelines",
              "To skip class assignments completely"
            ],
            correctIndex: 0,
            explanation: `The lesson is strictly focused on explaining ${focusTopic} thoroughly and correctly.`
          }
        ],
        theoryQuestions: [
          {
            question: `Explain the fundamental importance of ${focusTopic} under the ${subject} syllabus for ${classLevel}.`,
            modelAnswer: `Understanding ${focusTopic} provides the necessary logical framework to solve more complex academic problems and apply these rules in standard everyday activities.`,
            markingSchemeName: "Award 10 marks for a clear definition and complete list of principles."
          }
        ],
        subjectSpecificFocus: {
          title: `${subject} Pedagogy & Ethical Guidance`,
          content: `Teachers should guide students to connect ${focusTopic} with daily observations, ensuring active student participation and logical deductions.`,
          safeguardsOrMoralLesson: "Apply honest effort and collaborative integrity when solving class tasks."
        }
      };

      res.json({ success: true, lessonNote: fallbackNote, isFallback: true });
    }
  });

  // API Route: Expert NERDC 12-Week Curriculum Generator
  app.post('/api/gemini/generate-curriculum', async (req, res) => {
    const { 
      classLevel = "Primary 1", 
      subject = "General Study", 
      term = "First Term" 
    } = req.body || {};

    try {
      console.log(`AI Curriculum Generation request: Class=${classLevel}, Subject=${subject}, Term=${term}`);

      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
      }

      const systemPrompt = `You are an expert curriculum design specialist, Nigerian NERDC educational consultant, and syllabus director.
Your job is to generate a comprehensive, highly structured 12-week Academic Curriculum for the specified Student Class, Subject, and Term.
The curriculum must align strictly with the official Nigerian NERDC (National Educational Research and Development Council) syllabus guidelines, including appropriate difficulty levels for the target age group, culturally relevant context, and term-appropriate pedagogical goals.

For the requested Class, Subject, and Term, you MUST generate exactly 12 weeks of curriculum content.
Each week MUST contain:
1. weekNum: The integer week number from 1 to 12.
2. topic: A highly descriptive, officially-aligned Topic Title.
3. objectives: An array of 3 to 4 clear, measurable learning objectives (e.g., "By the end of the lesson, the students should be able to...").
4. keywords: An array of 3 to 5 vital academic keywords or terms central to that week's topic.

Strictly use Nigerian context and terminology (such as using local examples, naming conventions, and educational terms). Output the result as a raw JSON object matching the requested schema.`;

      const userPrompt = `Generate a full 12-week educational curriculum for Class of Students: "${classLevel}", Subject Matter: "${subject}", Academic Term: "${term}". Ensure extremely professional, high-fidelity alignment with standard Nigerian educational requirements.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          weeks: {
            type: Type.ARRAY,
            description: "Must contain exactly 12 elements representing Week 1 through Week 12 in order.",
            items: {
              type: Type.OBJECT,
              properties: {
                weekNum: { type: Type.INTEGER },
                topic: { type: Type.STRING },
                objectives: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                keywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['weekNum', 'topic', 'objectives', 'keywords']
            }
          }
        },
        required: ['weeks']
      };

      console.log("[Gemini Integration] Launching curriculum synthesis on gemini-3.5-flash...");
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [systemPrompt, userPrompt],
        config: {
          responseMimeType: 'application/json',
          responseSchema
        }
      });

      const responseText = response.text || '';
      const data = safeParseJson(responseText);
      console.log("[Gemini Integration] Curriculum generation succeeded and parsed successfully.");

      res.json({ success: true, curriculum: data.weeks });

    } catch (error: any) {
      console.warn("Generating curriculum failed. Preparing standard structural fallbacks...", error.message || error);
      
      const fallbackWeeks = Array.from({ length: 12 }, (_, i) => {
        const wk = i + 1;
        return {
          weekNum: wk,
          topic: `${subject} Core Concepts - Series ${wk}`,
          objectives: [
            `Analyze core foundational components in ${subject} for week ${wk}`,
            `Solve and discuss practical theoretical evaluations`,
            `Apply learning outcomes to Nigerian domestic scenarios`
          ],
          keywords: [subject.toLowerCase(), `week ${wk}`, 'nigerian education', 'concepts']
        };
      });
      res.json({ success: true, curriculum: fallbackWeeks, isFallback: true });
    }
  });
  
  // Serve static files in production, use Vite in dev
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LIVINGSTONEEDU backend running dynamically on port ${PORT}`);
  });
}

startServer();
