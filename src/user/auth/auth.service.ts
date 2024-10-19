import { ConflictException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserType } from '@prisma/client';

interface SignupParams {
    name: string,
    email: string,
    password: string,
    phone: string,
}

interface SigninParams {
    email: string,
    password: string,
}

@Injectable()
export class AuthService {
    constructor(private readonly prismaService: PrismaService) { }

    async signup(
        { name, email, password, phone }: SignupParams,
        type: UserType
    ) {
        const userExists = await this.prismaService.user.findUnique({
            where: {
                email: email
            }
        });
        if (userExists) throw new ConflictException();

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.prismaService.user.create({
            data: {
                email,
                name,
                phone,
                password: hashedPassword,
                user_type: type
            },
        });

        const token = await this.generateJwt(name, user.id);

        return token;

    }

    async signin({email, password}: SigninParams) {
        const userExists = await this.prismaService.user.findUnique({
            where: {
                email: email
            }
        });
        if (!userExists) throw new HttpException('Invalid credentials!', 400);

        const hashedPassword = userExists.password;

        const isPasswordMatch = await bcrypt.compare(password, hashedPassword);

        if (!isPasswordMatch) throw new HttpException('Invalid credentials!', 400);

        const token = await this.generateJwt(userExists.name, userExists.id);

        return token;

    }

    private async generateJwt(name: string, id: number) {
        const token = await jwt.sign({
            name,
            id
        }, process.env.JSON_WEB_TOKEN_KEY, {
            expiresIn: 3600
        });

        return token;
    }

    async generateProductKey(email: string, type: string) {
        const key = `${email}-${type}-${process.env.FOR_GENERATE_PRODUCT_KEY_SECRET}`
        return await bcrypt.hash(key, 10);
    }

    async verifyProductKey(originalKey: string, requestedKey: string) {
        return await bcrypt.compare(originalKey, requestedKey);
    }
}
