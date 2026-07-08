import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';

export function adminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  // baseUrl + path gives the original request URL inside routers
  const requestPath = req.baseUrl + req.path;
  
  // Exclude public get requests and public submissions
  if (
    requestPath === '/api/admin/log-activity' || 
    requestPath === '/api/admin/add-inquiry' || 
    (requestPath === '/api/admin/config' && req.method === 'GET')
  ) {
    return next();
  }

  const adminRole = req.headers['x-admin-role'];
  const adminEmail = req.headers['x-admin-email'];

  // Check super administrator bypass
  if (typeof adminEmail === 'string' && adminEmail.toLowerCase() === 'toped18@gmail.com') {
    Logger.authEvent('SuperAdminBypass', adminEmail, true);
    return next();
  }

  // Check admin role
  if (adminRole === 'admin' && typeof adminEmail === 'string') {
    Logger.authEvent('AdminAccess', adminEmail, true);
    return next();
  }

  Logger.warn('AUTH', `Blocked Unauthorized Admin Request: Path: ${requestPath} Method: ${req.method} Role: ${adminRole} Email: ${adminEmail}`);
  Logger.authEvent('AdminAccessDenied', String(adminEmail || 'anonymous'), false);
  
  return ApiResponse.error(
    res, 
    'Forbidden', 
    'Access Denied. Access to this administrative system is restricted to verified App Owner accounts.',
    403
  );
}
