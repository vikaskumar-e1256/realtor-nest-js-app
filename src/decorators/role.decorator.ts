import { SetMetadata, createParamDecorator } from "@nestjs/common";
import { UserType } from "@prisma/client";

export const Role = (...roles: UserType[]) => {
    return SetMetadata('roles', roles);
};
