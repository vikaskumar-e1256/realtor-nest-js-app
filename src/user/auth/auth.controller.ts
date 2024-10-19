import { Body, Controller, Get, Param, ParseEnumPipe, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, SigninDto, GenerateProductKeyDto } from '../dtos/auth/auth.dto';
import { UserType } from '@prisma/client';
import { AuthUser, UserInfo } from '../decorators/user.decorator';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post('signup/:userType')
    async signup(
        @Body() body: SignupDto,
        @Param('userType', new ParseEnumPipe(UserType)) type: UserType
    ) {
        if (type !== UserType.BUYER) {
            if (!body.productKey) throw new UnauthorizedException();
            const validProductKey = `${body.email}-${type}-${process.env.FOR_GENERATE_PRODUCT_KEY_SECRET}`;
            const isProductKeyVerified = await this.authService.verifyProductKey(validProductKey, body.productKey);
            if (!isProductKeyVerified) throw new UnauthorizedException();
        }

        return this.authService.signup(body, type);
    }

    @Post('signin')
    async signin(
        @Body() body: SigninDto
    ) {
        return this.authService.signin(body);
    }

    @Post('key')
    async generateProductKey(
        @Body() {type, email}: GenerateProductKeyDto
    ) {
        return this.authService.generateProductKey(email, type);
    }

    @Get('/me')
    async me(
        @AuthUser() user: UserInfo
    ) {
        return user;
    }
}
