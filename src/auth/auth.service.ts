/* eslint-disable prettier/prettier */
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './../prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async login(dto: AuthDto) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          email: dto.email,
        },
      });

      if (!user) {
        throw new ForbiddenException('User not found');
      } else {
        const isValid = await argon.verify(user.password, dto.password);
        if (!isValid) {
          throw new ForbiddenException('Invalid password');
        } else {
          delete user.password;
          return {
            user,
            access_token: await this.signToken(user.id, user.email),
          };
        }
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            throw new ForbiddenException('Email already exists');
          case 'P2003':
            throw new ForbiddenException('Invalid password');
          case 'P2004':
            throw new ForbiddenException('Invalid email');
          case 'P2005':
            throw new ForbiddenException('Invalid email');
          default:
            throw new ForbiddenException('Unknown error');
        }
      }
      throw new ForbiddenException(error.message);
    }
  }

  async signup(dto: AuthDto) {
    const hashedPassword = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          name: 'test',
          email: dto.email,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

      return {
        user,
        access_token: await this.signToken(user.id, user.email),
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            throw new ForbiddenException('Email already exists');
        }
      }
      throw new ForbiddenException(error.message);
    }
  }

  async signToken(userId: number, email: string): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };
    const accessToken = await this.jwt.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
    });
    return accessToken;
  }
}
