import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { JWT_ALGORITHM } from '../constants';

export interface JwtUserPayload {
  sub: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const secret = this.config.get<string>('NEXTAUTH_SECRET');
    if (!secret) {
      throw new UnauthorizedException('Server auth misconfigured');
    }

    try {
      const decoded = jwt.verify(token, secret, {
        algorithms: [JWT_ALGORITHM],
      }) as JwtUserPayload;

      if (!decoded || typeof decoded.sub !== 'string') {
        throw new UnauthorizedException('Invalid token payload');
      }

      (request as Request & { user: JwtUserPayload }).user = decoded;
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: Request): string | null {
    const header = request.headers['authorization'];
    if (!header || typeof header !== 'string') {
      return null;
    }
    const [scheme, value] = header.split(' ');
    if (scheme !== 'Bearer' || !value) {
      return null;
    }
    return value.trim();
  }
}
