import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// This Local Guard will trigger the Local Strategy (auth/local.strategy.ts) "validate" method
@Injectable()
export class PassportLocalGuard extends AuthGuard('local'){}