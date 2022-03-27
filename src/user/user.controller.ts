import { GetUser } from './../decorator/get-user.decorator';
import { JwtGuard } from './../auth/guard/jwt.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  @Get('/auth')
  getauth(@GetUser() user: User, @GetUser('email') email: string): any {
    return {
      user,
      email,
    };
  }
}
