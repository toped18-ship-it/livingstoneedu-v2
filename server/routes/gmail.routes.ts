import { Router } from 'express';
import { GmailController } from '../controllers/gmail.controller';
import { adminAuthMiddleware } from '../middleware/adminAuth';

const router = Router();

// Public signup notification
router.post('/notify-signup', GmailController.notifySignup);

// Privileged Gmail connection
router.post('/admin/gmail/save-connection', adminAuthMiddleware, GmailController.saveConnection);

export default router;
