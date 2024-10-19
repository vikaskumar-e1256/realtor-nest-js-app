import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import * as jwt from 'jsonwebtoken';

export class UserInterceptor implements NestInterceptor{
    async intercept(context: ExecutionContext, next: CallHandler) {
        const request = context.switchToHttp().getRequest();
        const token = request?.headers?.authorization?.split("Bearer ")[1];
        const user = await jwt.decode(token);
        request.user = user;

        return next.handle();
    }
}
