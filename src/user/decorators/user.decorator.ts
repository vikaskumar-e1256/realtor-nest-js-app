import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export interface UserInfo {
    name: string;
    id: number;
    iat: number;
    exp: number;
}

export const AuthUser = createParamDecorator((
    data: unknown, ctx: ExecutionContext
) => {
    const request = ctx.switchToHttp().getRequest();

    return request.user;
});
