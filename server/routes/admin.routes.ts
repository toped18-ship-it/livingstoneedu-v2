import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { adminAuthMiddleware } from '../middleware/adminAuth';

const router = Router();

// Apply admin role checks to all routes in this router
router.use(adminAuthMiddleware);

router.get('/secure-settings', AdminController.getSecureSettings);
router.post('/secure-settings', AdminController.updateSecureSettings);

router.get('/config', AdminController.getConfig);
router.post('/config', AdminController.updateConfig);

router.post('/playground', AdminController.playgroundRun);

router.get('/activities', AdminController.getActivities);
router.post('/activities/clear', AdminController.clearActivities);
router.post('/log-activity', AdminController.logActivity);

router.get('/inquiries', AdminController.getInquiries);
router.post('/add-inquiry', AdminController.addInquiry);
router.post('/inquiries/reply', AdminController.replyInquiry);

router.post('/send-push', AdminController.sendPushNotification);

export default router;
