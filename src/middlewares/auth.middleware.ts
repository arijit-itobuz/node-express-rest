import type { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { config } from '../configs/config.js';
import type { IJwtDecoded } from '../controllers/auth/jwt_decoded.interface.js';
import Exception from '../helpers/error.helper.js';

declare global {
  namespace Express {
    interface Request {
      user?: IJwtDecoded;
    }
  }
}

export async function auth_middleware(req: Request, res: Response, next: NextFunction) {
  try {
    const access_token = req.headers?.authorization?.slice(7);

    if (!access_token) {
      throw new Exception('Authentication Failed', httpStatus.UNAUTHORIZED, {});
    }

    try {
      const decoded = jwt.verify(access_token, config.jwt.auth_secret) as IJwtDecoded;
      req.user = decoded;
      next();
    } catch (error) {
      throw new Exception('Authentication Failed', httpStatus.UNAUTHORIZED, {});
    }
  } catch (error) {
    next(error);
  }
}