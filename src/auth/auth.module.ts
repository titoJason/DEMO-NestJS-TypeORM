import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './local.strategy';
import { PassportAuthController } from './passport-auth.controller';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      // brb : i think it should NOT be global?
      global: true,
      // brb: it should be taken from .env file
      secret: 'DEMO'
    })
  ],
  controllers: [AuthController, PassportAuthController],
  providers: [AuthService, LocalStrategy]
})
export class AuthModule {}
