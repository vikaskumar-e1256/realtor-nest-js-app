import { UserType } from "@prisma/client";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";


export class SignupDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @Matches(/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, {message: "Phone must be a phone number"})
    phone: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(5)
    password: string

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    productKey?: string
}

export class SigninDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string
}

export class GenerateProductKeyDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsEnum(UserType)
    type: UserType
}
