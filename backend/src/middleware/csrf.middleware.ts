import { Request, Response, NextFunction } from 'express';

export const csrfProtection = (req: Request, res: Response, next: NextFunction): any => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Exclude external webhooks (Telegram, Chapa) from browser CSRF header check
  if (req.path.includes('/telegram/webhook') || req.path.includes('/payments/webhook')) {
    return next();
  }

  const customHeader = req.headers['x-requested-with'] || req.headers['x-alphacut-request'];
  if (!customHeader) {
    return res.status(403).json({
      success: false,
      message: 'CSRF validation failed: Missing custom request header.',
    });
  }

  next();
};
