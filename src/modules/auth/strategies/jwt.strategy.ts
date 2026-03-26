import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'POOLMANAGEMENTSECRETKEY',
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub, // ✅ now using SQL id
      role: payload.role,
      locationId: payload.locationId,
    };
  }
}