import type { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import Exception from '../../common/error/exception.error.js';
import { respose_helper } from '../../common/helper/response.helper.js';
import type { AuthService } from '../../service/auth/auth.service.js';
import { signin_input_schema, type ISignInInput } from './dto/signin.input.js';
import { signup_input_schema, type ISignUpInput } from './dto/signup.input.js';

export class AuthController {
  constructor(private readonly auth_service: AuthService) {}

  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const signupDTO: ISignUpInput = req.body;

      const validation_result = signup_input_schema.safeParse(signupDTO);

      if (!validation_result.success) {
        throw new Exception('Signup validation failed', httpStatus.BAD_REQUEST, validation_result.error);
      }

      await this.auth_service.signup(signupDTO);

      respose_helper(res, httpStatus.CREATED, 'SignUp success', {});
    } catch (error) {
      next(error);
    }
  }

  async signin(req: Request, res: Response, next: NextFunction) {
    try {
      const signinDTO: ISignInInput = req.body;

      const validation_result = signin_input_schema.safeParse(signinDTO);

      if (!validation_result.success) {
        throw new Exception('Signin validation failed', httpStatus.BAD_REQUEST, validation_result.error);
      }

      const result = await this.auth_service.signin(signinDTO);

      respose_helper(res, httpStatus.OK, 'SignIn success', result);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async refresh_token(req: Request, res: Response, next: NextFunction) {
    try {
      const { refresh_token } = req.body;

      const result = await this.auth_service.refresh_token(refresh_token);

      respose_helper(res, httpStatus.OK, 'Refresh and Access Token generated', result);
    } catch (error) {
      next(error);
    }
  }

  async forgot_password(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new Exception('Invalid email', httpStatus.BAD_REQUEST, { email });
      }

      await this.auth_service.forgot_password(email);

      respose_helper(res, httpStatus.OK, 'Forgot password email sent', {});
    } catch (error) {
      next(error);
    }
  }

  async reset_password(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query;
      const { new_password } = req.body;

      if (!token) {
        throw new Exception('Invalid token', httpStatus.BAD_REQUEST, {});
      }

      if (!new_password) {
        throw new Exception('Invalid new password', httpStatus.BAD_REQUEST, {});
      }

      await this.auth_service.reset_password(String(token), new_password);

      respose_helper(res, httpStatus.OK, 'Reset password success', {});
    } catch (error) {
      next(error);
    }
  }
}
