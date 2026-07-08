import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { adminAuthMiddleware } from '../middleware/adminAuth';

const router = Router();

// Endpoint for sending pushes (can be used as public/admin)
router.post('/send', adminAuthMiddleware, AdminController.sendPushNotification);

export default router;
