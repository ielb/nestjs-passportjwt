/* eslint-disable prettier/prettier */
import { PrismaModule } from './../prisma/prisma.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [PrismaModule, JwtModule.register({}), JwtStrategy],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
