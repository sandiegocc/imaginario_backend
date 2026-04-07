import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface UserPayload {
  userId: string;
}

interface RequestWithUser extends Request {
  user: UserPayload;
}

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();

    const user = request.user;

    return data ? user?.[data as keyof UserPayload] : user;
  },
);
