import express from 'express';
import helmet from 'helmet';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { requestLoggerMiddleware } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';
import { getFirebaseAdminApp, isStandaloneMode } from './config/firebase';
import { getFirebaseDatabase } from './config/firebase';
import { Logger } from './utils/logger';

// Router imports
import lessonRoutes from './routes/lesson.routes';
import curriculumRoutes from './routes/curriculum.routes';
import examRoutes from './routes/exam.routes';
import gmailRoutes from './routes/gmail.routes';
import adminRoutes from './routes/admin.routes';
import notificationRoutes from './routes/notification.routes';

export async function createApp(): Promise<express.Application> {
  const app = express();

  // Enable trust proxy for reverse proxies (like Cloud Run or Nginx)
  app.set('trust proxy', 1);

  // 1. Configure Enterprise Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Turn off CSP for dev preview stability
      crossOriginEmbedderPolicy: false,
    })
  );

  // 2. Global JSON Body Parser
  app.use(express.json());

  // 3. Centralized Request Logger
  app.use(requestLoggerMiddleware);

  // 4. Rate Limiting on public APIs
  app.use('/api/', apiRateLimiter);

  // 5. API Route Mounts
  app.use('/api', gmailRoutes); // Public /notify-signup & /admin/gmail/save-connection
  app.use('/api/gemini', lessonRoutes); // Lesson generators
  app.use('/api/gemini', curriculumRoutes); // Curriculum generators
  app.use('/api/gemini', examRoutes); // Exam generators and grading
  app.use('/api/admin', adminRoutes); // Admin actions, configurations, activities, inquiries
  app.use('/api/notifications', notificationRoutes); // Pushes

  // RTDB privileged test write proxy (preserved from legacy server.ts)
  app.post('/api/rtdb/test-write', async (req, res, next) => {
    try {
      if (!isStandaloneMode()) {
        const db = getFirebaseDatabase();
        if (db) {
          const dbRef = db.ref('users/test_user');
          await dbRef.set({
            id: 'test_user',
            status: 'active',
            verifiedAt: new Date().toISOString(),
            message: 'Firebase Realtime Database initialized successfully by Livingstone Edu Learning Portal server'
          });
          Logger.info('App', 'Test write of users/test_user successful.');
          return res.json({ success: true });
        }
      }
      
      Logger.warn('App', 'Firebase Admin is in standalone/simulated database mode.');
      return res.json({ 
        success: true, 
        simulated: true, 
        message: 'Firebase Realtime Database is running in offline-first / simulated mode.' 
      });
    } catch (err: any) {
      next(err);
    }
  });

  // 6. Vite Integration & SPA Client Delivery
  if (process.env.NODE_ENV !== 'production') {
    Logger.info('App', 'Vite running in development mode. Mounting dev middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    Logger.info('App', 'Production mode active. Serving compiled static assets...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 7. Global Centralized Exception Handler
  app.use(errorHandler);

  return app;
}
