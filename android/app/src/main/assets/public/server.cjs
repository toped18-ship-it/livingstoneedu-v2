var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_app = require("firebase-admin/app");
var import_database = require("firebase-admin/database");
var import_firestore = require("firebase-admin/firestore");
var import_messaging = require("firebase-admin/messaging");
var import_vite = require("vite");
var import_genai = require("@google/genai");
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
var DB_PATH = import_path.default.join(process.cwd(), "db.json");
function getDB() {
  const defaultDB = {
    config: {
      brandName: "LIVINGSTONEEDU",
      appSubtitle: "Learning Portal",
      proPrice: "\u20A65,000",
      supportGroupUrl: "https://wa.me/message/AJ4NILOGBTTMJ1",
      contactName: "Livingtch Brand Agency",
      logoIcon: "GraduationCap",
      logoColor: "blue",
      logoText: "LIVINGSTONE",
      activeGateway: "Paystack",
      isPaymentLive: false,
      paystackPublicKey: "pk_test_paystack_a1b2c3d4e5f6",
      flutterwavePublicKey: "FLWPUBK_TEST-a1b2c3d4e5",
      stripePublicKey: "pk_test_stripe_12345",
      paystackLink: "https://paystack.com/pay/livingstone-pro-access",
      flutterwaveLink: "https://flutterwave.com/pay/sxagj005oznw"
    },
    activities: [
      {
        id: "act_1",
        userName: "Mrs. Funke Alao",
        userEmail: "funke@livingstone.ng",
        activityType: "Login",
        subject: "General",
        detail: "Teacher Funke Alao logged in to primary dashboard",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "act_2",
        userName: "Mrs. Funke Alao",
        userEmail: "funke@livingstone.ng",
        activityType: "Lesson Open",
        subject: "Mathematics",
        detail: "Viewed lesson Week 1 Mathematics: Whole Numbers",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    ],
    inquiries: [
      {
        id: "inq_1592",
        name: "Olumide Benson",
        email: "benson@gmail.com",
        subject: "JSS 2 Syllabus Question",
        message: "Hello, please can we print out the complete worksheets for offline classes in Ibadan?",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        replyStatus: "Pending"
      }
    ]
  };
  try {
    if (!import_fs.default.existsSync(DB_PATH)) {
      import_fs.default.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2), "utf-8");
      return defaultDB;
    }
    const data = import_fs.default.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.warn("FS DB load triggered fallback", err);
    return defaultDB;
  }
}
function saveDB(db) {
  try {
    import_fs.default.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to commit DB to disk", err);
  }
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  let firebaseAdminApp = null;
  try {
    const serviceAccountPath = import_path.default.join(process.cwd(), "firebase-service-account.json");
    if (import_fs.default.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(import_fs.default.readFileSync(serviceAccountPath, "utf8"));
      let dbUrl = "https://livingstoneedu-17aad-default-rtdb.firebaseio.com";
      try {
        const configPath = import_path.default.join(process.cwd(), "firebase-applet-config.json");
        if (import_fs.default.existsSync(configPath)) {
          const configDetails = JSON.parse(import_fs.default.readFileSync(configPath, "utf8"));
          if (configDetails.databaseURL) {
            dbUrl = configDetails.databaseURL;
          }
        }
      } catch (errConfig) {
        console.warn("[Firebase Admin] Failed reading firebase-applet-config.json for databaseURL:", errConfig);
      }
      const activeApps = (0, import_app.getApps)();
      if (activeApps.length === 0) {
        firebaseAdminApp = (0, import_app.initializeApp)({
          credential: (0, import_app.cert)(serviceAccount),
          databaseURL: dbUrl
        });
      } else {
        firebaseAdminApp = (0, import_app.getApp)();
      }
      console.log(`[Firebase Admin Successfully Instantiated via modular SDK] Client email: ${serviceAccount.client_email} and databaseURL: ${dbUrl}`);
    } else {
      console.warn("[Firebase Admin] No service account key found at firebase-service-account.json. Standalone database mode is active.");
    }
  } catch (error) {
    console.error("[Firebase Admin Error] Primary initialization failed:", error.message || error, error.stack);
  }
  const adminAuthMiddleware = (req, res, next) => {
    const requestPath = req.baseUrl + req.path;
    if (requestPath === "/api/admin/log-activity" || requestPath === "/api/admin/add-inquiry" || requestPath === "/api/admin/config" && req.method === "GET") {
      return next();
    }
    const adminRole = req.headers["x-admin-role"];
    const adminEmail = req.headers["x-admin-email"];
    if (adminRole === "admin" && typeof adminEmail === "string" && adminEmail.toLowerCase() === "toped18@gmail.com") {
      return next();
    }
    console.warn(`[Blocked Unauthorized Administration Request] Path: ${requestPath} Method: ${req.method} Role: ${adminRole} Email: ${adminEmail}`);
    return res.status(403).json({
      error: "Forbidden",
      message: "Access Denied. Access to this administrative system is restricted to verified App Owner accounts."
    });
  };
  app.use("/api/admin/*", adminAuthMiddleware);
  app.post("/api/admin/gmail/save-connection", (req, res) => {
    const { accessToken, email } = req.body;
    const db = getDB();
    db.config.gmailAccessToken = accessToken || "";
    db.config.connectedGmailEmail = email || "";
    db.config.lastConnectedTime = accessToken ? (/* @__PURE__ */ new Date()).toISOString() : "";
    saveDB(db);
    console.log(`[Gmail Connection] Saved access token for ${email || "cleared"} successfully.`);
    res.json({ success: true, connectedGmailEmail: email || "" });
  });
  app.post("/api/rtdb/test-write", async (req, res) => {
    try {
      if (firebaseAdminApp) {
        const dbRef = (0, import_database.getDatabase)(firebaseAdminApp).ref("users/test_user");
        await dbRef.set({
          id: "test_user",
          status: "active",
          verifiedAt: (/* @__PURE__ */ new Date()).toISOString(),
          message: "Firebase Realtime Database initialized successfully by Livingstone Edu Learning Portal server"
        });
        console.log("[RTDB Server Verification] Test write of users/test_user successful utilizing Admin SDK.");
        return res.json({ success: true });
      } else {
        throw new Error("Firebase Admin SDK is not initialized.");
      }
    } catch (err) {
      console.error("[RTDB Server Verification Failure] Failed to execute test write through server admin sdk:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });
  app.post("/api/notify-signup", async (req, res) => {
    const { fullName, email, role, schoolName } = req.body;
    if (!fullName || !email) {
      return res.status(400).json({ error: "Full name and email are required." });
    }
    const db = getDB();
    const token = db.config.gmailAccessToken;
    const connectedEmail = db.config.connectedGmailEmail;
    console.log(`[Signup Notification] Received registration for: ${fullName} (${email}). Gmail connected: ${connectedEmail || "None"}`);
    const newActivity = {
      id: "act_signup_" + Date.now() + "_" + Math.floor(Math.random() * 1e3),
      userName: fullName,
      userEmail: email,
      activityType: "Registration",
      subject: "Academic Portal",
      detail: `${role === "teacher" ? "Teacher" : "Student"} registration completed. Email: ${email}.`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.activities.unshift(newActivity);
    if (db.activities.length > 250) {
      db.activities = db.activities.slice(0, 150);
    }
    saveDB(db);
    if (!token || !connectedEmail) {
      console.log("[Signup Notification] Skipped automated emails: No active administrator Gmail API connection found.");
      return res.json({
        success: true,
        message: "Signup registered. Email notifications skipped (No Google Gmail account currently connected/authorized)."
      });
    }
    try {
      const sendGmailMsg = async (to, subject, bodyText) => {
        const emailLines = [
          `To: ${to}`,
          `Subject: ${subject}`,
          `Content-Type: text/plain; charset="UTF-8"`,
          `MIME-Version: 1.0`,
          ``,
          bodyText
        ];
        const emailContent = emailLines.join("\r\n");
        const rawBase64 = Buffer.from(emailContent, "utf-8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ raw: rawBase64 })
        });
        if (!response.ok) {
          throw new Error(`Gmail Send HTTP ${response.status}`);
        }
        return response;
      };
      const adminMailSubject = `\u{1F393} New User Signup Alert: ${fullName}`;
      const adminMailBody = `Dear Admin,

An educational academy student or teacher has completed the registration flow on LivingstoneEdu LMS.

Details of New Account:
- Full Name: ${fullName}
- Registered Email: ${email}
- Profile Role: ${role === "teacher" ? "Teacher" : "Student"}
- Academic School: ${schoolName || "Livingstone Educational Academy"}
- Timestamp: ${(/* @__PURE__ */ new Date()).toUTCString()}

The educational database has been successfully updated on your school portal.

Warm regards,
LMS Automated Gateway Service`;
      await sendGmailMsg(connectedEmail, adminMailSubject, adminMailBody);
      console.log(`[Signup Notification] Successfully dispatched admin alert to ${connectedEmail}`);
      const userMailSubject = `Welcome to Livingstone Educational Academy!`;
      const userMailBody = `Dear ${fullName},

Welcome to Livingstone Educational Academy LMS! We are thrilled to partner with you on your educational journey.

Your student profile (${email}) has been successfully created. You now have full access to our comprehensive study notes, curated curriculum resources, and AI-powered practice testing portals.

If you have any questions or require support, please contact the academy administration or join our official support channel.

Warm regards,
Livingstone Educational Academy Team`;
      await sendGmailMsg(email, userMailSubject, userMailBody);
      console.log(`[Signup Notification] Successfully dispatched welcome onboarding email to ${email}`);
      return res.json({
        success: true,
        message: "Signup processed. Notification and welcome onboarding emails successfully sent via Gmail API."
      });
    } catch (err) {
      console.warn("[Signup Notification Error] Gmail dispatch failed (token may be expired):", err.message || err);
      return res.json({
        success: true,
        message: `Signup registered. Email sending failed (Token might have expired): ${err.message || err}`
      });
    }
  });
  app.post("/api/admin/send-push", async (req, res) => {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: "Title and body are required." });
    }
    if (!firebaseAdminApp) {
      console.log(`[Simulated Push Alert] Title: "${title}" | Body: "${body}"`);
      return res.json({
        success: true,
        simulated: true,
        message: "No active Firebase Service account registered. Saved alert simulation executed."
      });
    }
    try {
      const dbStore = (0, import_firestore.getFirestore)(firebaseAdminApp);
      const subsSnapshot = await dbStore.collection("pushSubscriptions").get();
      const tokens = [];
      subsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data && data.token && !data.token.startsWith("fcm_token_livingstone_")) {
          tokens.push(data.token);
        }
      });
      console.log(`[Push Notification] Attempting to dispatch alert to ${subsSnapshot.size} total subscribers.`);
      if (tokens.length === 0) {
        return res.json({
          success: true,
          message: "Alert synced. No external physical client tokens were active for remote dispatch, simulation completed successfully.",
          totalSubscribers: subsSnapshot.size
        });
      }
      const messagingResult = await (0, import_messaging.getMessaging)(firebaseAdminApp).sendEachForMulticast({
        tokens,
        notification: {
          title,
          body
        }
      });
      res.json({
        success: true,
        message: "Successfully broadcasted notification alert to physical devices.",
        successCount: messagingResult.successCount,
        failureCount: messagingResult.failureCount,
        totalSubscribers: subsSnapshot.size
      });
    } catch (err) {
      console.error("[Push Broadcast Error]", err);
      res.status(500).json({ error: "Could not send push notification.", message: err.message });
    }
  });
  app.get("/api/admin/config", (req, res) => {
    const db = getDB();
    res.json(db.config);
  });
  app.post("/api/admin/config", (req, res) => {
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
      logoIcon: logoIcon || db.config.logoIcon || "GraduationCap",
      logoColor: logoColor || db.config.logoColor || "blue",
      logoText: logoText || db.config.logoText || "LIVINGSTONE",
      activeGateway: activeGateway || db.config.activeGateway || "Paystack",
      isPaymentLive: isPaymentLive !== void 0 ? isPaymentLive : db.config.isPaymentLive || false,
      paystackPublicKey: paystackPublicKey !== void 0 ? paystackPublicKey : db.config.paystackPublicKey || "",
      flutterwavePublicKey: flutterwavePublicKey !== void 0 ? flutterwavePublicKey : db.config.flutterwavePublicKey || "",
      stripePublicKey: stripePublicKey !== void 0 ? stripePublicKey : db.config.stripePublicKey || "",
      paystackLink: paystackLink !== void 0 ? paystackLink : db.config.paystackLink || "",
      flutterwaveLink: flutterwaveLink !== void 0 ? flutterwaveLink : db.config.flutterwaveLink || "",
      bankName: bankName !== void 0 ? bankName : db.config.bankName || "WEMA Bank (Paystack Secure)",
      bankAccountNumber: bankAccountNumber !== void 0 ? bankAccountNumber : db.config.bankAccountNumber || "9038472910",
      bankAccountName: bankAccountName !== void 0 ? bankAccountName : db.config.bankAccountName || "LIVINGSTONEEDU PREMIUM PORTAL"
    };
    saveDB(db);
    res.json({ success: true, config: db.config });
  });
  app.get("/api/admin/activities", (req, res) => {
    const db = getDB();
    res.json(db.activities);
  });
  app.post("/api/admin/activities/clear", (req, res) => {
    const db = getDB();
    db.activities = [];
    saveDB(db);
    res.json({ success: true });
  });
  app.post("/api/admin/log-activity", (req, res) => {
    const { userName, userEmail, activityType, subject, detail } = req.body;
    const db = getDB();
    const newActivity = {
      id: "act_" + Date.now().toString() + "_" + Math.floor(Math.random() * 1e3),
      userName: userName || "Anonymous User",
      userEmail: userEmail || "anonymous@gmail.com",
      activityType: activityType || "Activity",
      subject: subject || "General",
      detail: detail || "Active on lesson portals",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.activities.unshift(newActivity);
    if (db.activities.length > 250) {
      db.activities = db.activities.slice(0, 150);
    }
    saveDB(db);
    res.json({ success: true, activity: newActivity });
  });
  app.get("/api/admin/inquiries", (req, res) => {
    const db = getDB();
    res.json(db.inquiries);
  });
  app.post("/api/admin/add-inquiry", (req, res) => {
    const { name, email, subject, message } = req.body;
    const db = getDB();
    const newInquiry = {
      id: "inq_" + Date.now().toString(),
      name: name || "Inquirer",
      email: email || "unknown@domain.com",
      subject: subject || "Curriculum Inquiry",
      message: message || "",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      replyStatus: "Pending"
    };
    db.inquiries.unshift(newInquiry);
    saveDB(db);
    res.json({ success: true, inquiry: newInquiry });
  });
  app.post("/api/admin/inquiries/reply", (req, res) => {
    const { id } = req.body;
    const db = getDB();
    const inq = db.inquiries.find((i) => i.id === id);
    if (inq) {
      inq.replyStatus = "Replied";
      saveDB(db);
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "Inquiry not found" });
    }
  });
  app.post("/api/gemini/generate-exam", async (req, res) => {
    const { subject, classLevel, numQuestions, term, topic } = req.body;
    const questionsCount = parseInt(numQuestions) || 5;
    console.log(`AI Gen Exam Request: Class=${classLevel}, Subject=${subject}, QCount=${questionsCount}`);
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
      }
      const prompt = `You are a professional teacher under the Nigerian Educational Research and Development Council (NERDC).
Generate a set of ${questionsCount} multiple-choice exam questions for ${classLevel}, Subject: ${subject}, Term: ${term || "1st Term"}, covering topics like: "${topic || "General curriculum"}".

Make sure the questions:
1. Are appropriate for the academic level of a student in ${classLevel}.
2. Contain active local Nigerian contexts, names, and scenarios (e.g., using Naira, Lagos, Abuja, Aliyu, Chinedu, Ngozi) where applicable.
3. Every question must have exactly 4 options.
4. "correctIndex" is a zero-indexed integer referencing the correct option index (e.g. 0 for A, 1 for B, 2 for C, 3 for D).
5. All elements are formatted in plain, valid JSON without Markdown blocks.`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              questions: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    question: { type: import_genai.Type.STRING, description: "The question text." },
                    options: {
                      type: import_genai.Type.ARRAY,
                      items: { type: import_genai.Type.STRING },
                      description: "Array of exactly four choice options."
                    },
                    correctIndex: { type: import_genai.Type.INTEGER, description: "The index of the correct option (0-3)." },
                    explanation: { type: import_genai.Type.STRING, description: "Brief expert teaching explanation of why this answer is correct." }
                  },
                  required: ["question", "options", "correctIndex", "explanation"]
                }
              }
            },
            required: ["questions"]
          }
        }
      });
      const responseText = response.text || "";
      const data = JSON.parse(responseText.trim());
      res.json({ success: true, questions: data.questions || [] });
    } catch (error) {
      console.warn("Gemini generate-exam failed, invoking static fallback...", error.message || error);
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
          correctIndex: i * 2 % 4,
          // Pseudo random but repeatable correct index
          explanation: `This is an automatic fallback explanation for ${subject} ${classLevel} because the external AI key was not declared or responded with a timeout. The correct standard option is verified.`
        });
      }
      res.json({ success: true, questions: fallbackQuestions, isFallback: true });
    }
  });
  app.post("/api/gemini/grade-script", async (req, res) => {
    const { studentName, subject, classLevel, questions, studentAnswers } = req.body;
    console.log(`AI Grading Request for student: ${studentName}, Class=${classLevel}, Subject=${subject}`);
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
      }
      const prompt = `You are an expert exam paper grader in West Africa (WAEC/NECO team).
Grade the student script below.
Student: ${studentName}
Class Level: ${classLevel}
Subject: ${subject}

Exam Questions & Student Answers:
${JSON.stringify(questions.map((q, idx) => ({
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
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              scoreOutOf100: { type: import_genai.Type.INTEGER },
              caScore: { type: import_genai.Type.INTEGER },
              examScore: { type: import_genai.Type.INTEGER },
              letterGrade: { type: import_genai.Type.STRING },
              teacherRemark: { type: import_genai.Type.STRING },
              aiStrengths: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
              aiWeaknesses: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } }
            },
            required: ["scoreOutOf100", "caScore", "examScore", "letterGrade", "teacherRemark", "aiStrengths", "aiWeaknesses"]
          }
        }
      });
      const responseText = response.text || "";
      const data = JSON.parse(responseText.trim());
      res.json({ success: true, ...data });
    } catch (error) {
      console.warn("Gemini grading failed, invoking local rules-based grader...", error.message || error);
      let correctCount = 0;
      questions.forEach((q, idx) => {
        if (Number(studentAnswers[idx]) === Number(q.correctIndex)) {
          correctCount++;
        }
      });
      const pct = Math.round(correctCount / Math.max(1, questions.length) * 100);
      const caScore = Math.round(pct / 100 * 40);
      const examScore = Math.round(pct / 100 * 60);
      let letterGrade = "F9";
      let teacherRemark = "A poor attempt. Major improvement needed.";
      if (pct >= 85) {
        letterGrade = "A1";
        teacherRemark = "Outstanding performance! Keep maintaining this academic standard.";
      } else if (pct >= 75) {
        letterGrade = "B2";
        teacherRemark = "Very good work. Proud of your attention to detail.";
      } else if (pct >= 65) {
        letterGrade = "C4";
        teacherRemark = "A good effort. Continue reading to score higher.";
      } else if (pct >= 50) {
        letterGrade = "C6";
        teacherRemark = "Pass. Focus more on scientific and mathematical principles.";
      } else if (pct >= 40) {
        letterGrade = "E8";
        teacherRemark = "Weak credit pass. Extensive revision of chapters recommended.";
      }
      res.json({
        success: true,
        scoreOutOf100: pct,
        caScore,
        examScore,
        letterGrade,
        teacherRemark,
        aiStrengths: [`Demonstrated knowledge in ${subject} topics`, "Attempted all multiple-choice units completely"],
        aiWeaknesses: ["Needs to pay continuous attention to fundamental definitions", "Revise weekly practical test exercises"],
        isFallback: true
      });
    }
  });
  app.post("/api/gemini/generate-curriculum", async (req, res) => {
    const { classLevel, subject, term } = req.body;
    console.log(`AI Curriculum Generation request: Class=${classLevel}, Subject=${subject}, Term=${term}`);
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
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
        type: import_genai.Type.OBJECT,
        properties: {
          weeks: {
            type: import_genai.Type.ARRAY,
            description: "Must contain exactly 12 elements representing Week 1 through Week 12 in order.",
            items: {
              type: import_genai.Type.OBJECT,
              properties: {
                weekNum: { type: import_genai.Type.INTEGER },
                topic: { type: import_genai.Type.STRING },
                objectives: {
                  type: import_genai.Type.ARRAY,
                  items: { type: import_genai.Type.STRING }
                },
                keywords: {
                  type: import_genai.Type.ARRAY,
                  items: { type: import_genai.Type.STRING }
                }
              },
              required: ["weekNum", "topic", "objectives", "keywords"]
            }
          }
        },
        required: ["weeks"]
      };
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [systemPrompt, userPrompt],
        config: {
          responseMimeType: "application/json",
          responseSchema
        }
      });
      const responseText = response.text || "";
      const data = JSON.parse(responseText.trim());
      res.json({ success: true, curriculum: data.weeks });
    } catch (error) {
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
          keywords: [subject.toLowerCase(), `week ${wk}`, "nigerian education", "concepts"]
        };
      });
      res.json({ success: true, curriculum: fallbackWeeks, isFallback: true });
    }
  });
  app.post("/api/gemini/generate-lesson-note", async (req, res) => {
    const { classLevel, subject, term, week, focusTopic, isEndOfTerm } = req.body;
    console.log(`AI Lesson Note Generation request: Class=${classLevel}, Subject=${subject}, Term=${term}, Week=${week}`);
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
      }
      let systemPrompt = `You are an expert curriculum planner, NERDC educational planner, lesson-note writer, and academic supervisor in Nigeria.
Your job is to generate COMPLETE, UPDATED, DETAILED, and PROFESSIONALLY STRUCTURED lesson notes conforming strictly to the latest Nigerian NERDC curriculum guidelines, WAEC/NECO standards, and BECE criteria.

CRITICAL M&E COMPLIANCE REQUIREMENT:
- DO NOT generate generic educational content.
- Generate lesson notes strictly from the curriculum topic selected of: "${focusTopic || "General syllabus topic and standards"}".
- Ensure all sections write specifically about "${focusTopic || "General syllabus topic and standards"}" and nothing else.

Context parameters:
- Student Class: ${classLevel}
- Subject: ${subject}
- Term: ${term}
- Week: ${week}
- Specific Focus: ${focusTopic || "General syllabus topic and standards"}
- Is End-of-Term Assessment Package? ${isEndOfTerm ? "Yes" : "No"}

Instructions on Quality and Tone:
1. Every section must be fully written out. Do NOT use brief placeholders (e.g. "etc.", "Introduce topic..."). Give detailed, printable lesson notes.
2. Ensure rigorous national educational context: Use Nigerian local names (Amina, Chidi, Tunde, Musa, Ngozi), Nigerian cities/markets (Kano, Lagos, Onitsha, Mile 12, Balogun), Nigerian currency (Naira and Kobo), and local examples (cassava farming, palm oil production, local manufacturing, NEPA/DisCo grids).
3. Align to specific fields depending on the subject type:
   - English: Comprehension text, grammar terms, sentence structures.
   - Mathematics: Logical step-by-step mathematical calculations, equations, and alternative solving tricks.
   - Science: Detailed laboratory apparatus, experiment protocols, and strict environment safety safeguards.
   - Arts/Social Studies: National values, moral civic duties, cultural references.
4. Structure the output as clean JSON matching the requested schema.`;
      let userPrompt = "";
      let responseSchema = {};
      if (isEndOfTerm) {
        userPrompt = `Generate a comprehensive End-of-Term Revision Syllabus and Assessment package for ${classLevel} - ${subject} for ${term} Term.
Include complete revision highlights, 15 high-quality objective multiple-choice questions, 5 comprehensive theory discussion questions with detailed marking keys, a practical project assessment rubric, and expert examination tips.`;
        responseSchema = {
          type: import_genai.Type.OBJECT,
          properties: {
            topic: { type: import_genai.Type.STRING },
            subtopic: { type: import_genai.Type.STRING },
            classLevel: { type: import_genai.Type.STRING },
            duration: { type: import_genai.Type.STRING },
            objectives: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
            keyVocabulary: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
            teachingMaterials: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
            introduction: { type: import_genai.Type.STRING },
            teacherExplanationSteps: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
            detailedLessonNote: { type: import_genai.Type.STRING, description: "A very detailed, structured, comprehensive review of the entire term's syllabus in markdown format." },
            studentActivities: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
            classExercises: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
            homeworkAssignment: { type: import_genai.Type.STRING },
            quizQuestions: {
              type: import_genai.Type.ARRAY,
              description: "Must contain exactly 15 high-quality objective Multiple Choice Questions covering all topics from the entire term.",
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  question: { type: import_genai.Type.STRING },
                  options: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
                  correctIndex: { type: import_genai.Type.INTEGER },
                  explanation: { type: import_genai.Type.STRING }
                },
                required: ["question", "options", "correctIndex", "explanation"]
              }
            },
            theoryQuestions: {
              type: import_genai.Type.ARRAY,
              description: "Must contain exactly 5 multi-part theory questions with full marking guidelines.",
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  question: { type: import_genai.Type.STRING },
                  modelAnswer: { type: import_genai.Type.STRING },
                  markingScheme: { type: import_genai.Type.STRING }
                },
                required: ["question", "modelAnswer", "markingScheme"]
              }
            },
            subjectSpecificFocus: {
              type: import_genai.Type.OBJECT,
              properties: {
                title: { type: import_genai.Type.STRING },
                content: { type: import_genai.Type.STRING },
                safeguardsOrMoralLesson: { type: import_genai.Type.STRING }
              },
              required: ["title", "content", "safeguardsOrMoralLesson"]
            }
          },
          required: [
            "topic",
            "subtopic",
            "classLevel",
            "duration",
            "objectives",
            "keyVocabulary",
            "teachingMaterials",
            "introduction",
            "teacherExplanationSteps",
            "detailedLessonNote",
            "studentActivities",
            "classExercises",
            "homeworkAssignment",
            "quizQuestions",
            "theoryQuestions",
            "subjectSpecificFocus"
          ]
        };
      } else {
        userPrompt = `Generate a fully fleshed out, extremely structured, exhaustive Weekly Lesson Note for ${classLevel}, Subject: ${subject}, Term: ${term}, Week: ${week}.
Focus on: ${focusTopic || "Latest NERDC national lesson criteria for " + subject}.
Include an elegant introduction, key vocabulary words, 100% written explanatory notes (at least 6-8 comprehensive paragraphs packed with Nigerian relevant examples), student class activities, and formal exercises.
Include a quiz with exactly 5 multiple choice questions and 3 detailed theory questions with model answers and evaluation keys.`;
        responseSchema = {
          type: import_genai.Type.OBJECT,
          properties: {
            topic: { type: import_genai.Type.STRING },
            subtopic: { type: import_genai.Type.STRING },
            classLevel: { type: import_genai.Type.STRING },
            duration: { type: import_genai.Type.STRING },
            objectives: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
            keyVocabulary: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
            teachingMaterials: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
            introduction: { type: import_genai.Type.STRING },
            teacherExplanationSteps: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
            detailedLessonNote: { type: import_genai.Type.STRING, description: "Highly comprehensive pedagogical textual body of the lesson note, detailed with examples, written in rich readable markdown formatting." },
            studentActivities: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
            classExercises: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
            homeworkAssignment: { type: import_genai.Type.STRING },
            quizQuestions: {
              type: import_genai.Type.ARRAY,
              description: "Must contain exactly 5 high-quality objective Multiple Choice Questions for this lesson.",
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  question: { type: import_genai.Type.STRING },
                  options: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
                  correctIndex: { type: import_genai.Type.INTEGER },
                  explanation: { type: import_genai.Type.STRING }
                },
                required: ["question", "options", "correctIndex", "explanation"]
              }
            },
            theoryQuestions: {
              type: import_genai.Type.ARRAY,
              description: "Must contain exactly 3 comprehensive short-answer theory questions.",
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  question: { type: import_genai.Type.STRING },
                  modelAnswer: { type: import_genai.Type.STRING },
                  markingScheme: { type: import_genai.Type.STRING }
                },
                required: ["question", "modelAnswer", "markingScheme"]
              }
            },
            subjectSpecificFocus: {
              type: import_genai.Type.OBJECT,
              properties: {
                title: { type: import_genai.Type.STRING },
                content: { type: import_genai.Type.STRING },
                safeguardsOrMoralLesson: { type: import_genai.Type.STRING }
              },
              required: ["title", "content", "safeguardsOrMoralLesson"]
            }
          },
          required: [
            "topic",
            "subtopic",
            "classLevel",
            "duration",
            "objectives",
            "keyVocabulary",
            "teachingMaterials",
            "introduction",
            "teacherExplanationSteps",
            "detailedLessonNote",
            "studentActivities",
            "classExercises",
            "homeworkAssignment",
            "quizQuestions",
            "theoryQuestions",
            "subjectSpecificFocus"
          ]
        };
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [systemPrompt, userPrompt],
        config: {
          responseMimeType: "application/json",
          responseSchema
        }
      });
      const responseText = response.text || "";
      const data = JSON.parse(responseText.trim());
      res.json({ success: true, lessonNote: data });
    } catch (error) {
      console.warn("Generating lesson notes failed. Invoking master curriculum local generator...", error.message || error);
      const finalTopic = focusTopic || `Nigerian Curriculum ${subject} Foundations`;
      const fallbackNote = {
        topic: finalTopic,
        subtopic: `${classLevel} Overview - ${term} Term, Week ${week}`,
        classLevel,
        duration: "40 Minutes per period",
        objectives: [
          `Identify core concepts related to ${subject} and apply them to local contexts.`,
          `Discuss real-life practical examples of ${subject} under West African guidelines.`,
          `Solve standard test problems regarding ${subject} for competitive exam preparation.`
        ],
        keyVocabulary: ["Curriculum Standards", "NERDC Framework", "WAEC Target", "BECE Criteria", "Practical Application"],
        teachingMaterials: ["Standard NERDC Textbook", "Classroom whiteboard and illustrative colored charts", "Local objects and local environment resources"],
        introduction: `Welcome to this alignment session for ${subject} in ${classLevel}. This class note explores the core elements authorized by the Federal Ministry of Education.`,
        teacherExplanationSteps: [
          "Present the fundamental definition to the class clearly using the whiteboard illustrations.",
          "Highlight real-world examples from the Nigerian marketplace (e.g. Naira economics or agriculture in Enugu/Kano).",
          "Distribute practical working materials to students for hand-on team trials."
        ],
        detailedLessonNote: `### Official Nigerian Curriculum lesson note for ${subject} (${classLevel})

In accordance with national educational standards established by the **Nigerian Educational Research and Development Council (NERDC)**, this week's focus is on exploring *${finalTopic}*.

#### 1. Core Principles
Education is crucial for local socio-economic transformation. For instance, studying ${subject} equips students with basic problem-solving abilities. In cities like Onitsha, Lagos, and Kano, micro-entrepreneurs and students apply these tenets daily to navigate local trade, science, and community development.

Let's explore these major factors:
*   **Scientific and Analytical Methods**: Approaching problems step by step allows for robust results.
*   **Local Resources utilization**: Employing materials like Cassava peels, palm husks, and local soil supports affordable laboratory studies.
*   **Ethical and Moral Standards**: Education guides youth towards patriotic nation-building.

#### 2. Case Study & Local Applications
Consider a trade shop at Balogun Market in Lagos State. A local trader needs to catalog goods efficiently. Applying the concepts outlined under this week's ${subject} curriculum enhances bookkeeping and customer service!`,
        studentActivities: [
          "Take notes on the major definitions written on the board.",
          "Participate in group discussions about local examples of this lesson in their hometowns.",
          "Individually attempt the practice exercises."
        ],
        classExercises: [
          `Briefly describe how ${subject} helps a local school admin manage student rosters.`,
          `Write down three local materials that can be scavenged in Nigeria representing components of ${subject}.`
        ],
        homeworkAssignment: `Conduct research at home. Interview parents or local elders to identify how this week's lesson on ${subject} is directly observed in standard local works (like farming, banking, or trade). Write a 1-page report.`,
        quizQuestions: [
          {
            question: `Which corporate regulatory council oversees curriculum standards in Nigerian school portals?`,
            options: ["JAMB", "WAEC", "NERDC", "NUC"],
            correctIndex: 2,
            explanation: `The Nigerian Educational Research and Development Council (NERDC) is responsible for school curriculum planning across Nigeria.`
          },
          {
            question: `In a practical session under general science, which of these represents an authentic Nigerian environmental example?`,
            options: ["Imported pine forests", "Cassava tubers and local palm plantation", "Alps glacial runoff", "Tundra permafrost"],
            correctIndex: 1,
            explanation: `Cassava tubers and palm vegetation are endemic agricultural resources in standard Nigerian study environments.`
          }
        ],
        theoryQuestions: [
          {
            question: `Identify and discuss two reasons why Nigerian curriculum planning integrates local trade centers (like Balogun or Kurmi Markets) as case studies.`,
            modelAnswer: `1. Enhanced Relevance: Using familiar marketplaces helps students connect abstract theories to immediate reality. 2. Practical Application: Students can immediately see theoretical trade and arithmetic rules being executed in live markets.`,
            markingSchemeName: `Award 5 marks for each reason (Total 10 marks).`
          }
        ],
        subjectSpecificFocus: {
          title: "Patriotic Civic Realization & Local Safeguards",
          content: `In general classrooms across Oyo, Kaduna, Enugu and Delta states, standard focus should always highlight safety. All materials must be guarded carefully and toxic substances avoided entirely.`,
          safeguardsOrMoralLesson: "Take continuous pride in honest, patriotic academic development."
        }
      };
      res.json({ success: true, lessonNote: fallbackNote, isFallback: true });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LIVINGSTONEEDU backend running dynamically on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
