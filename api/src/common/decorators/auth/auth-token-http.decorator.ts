import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from '../../types/auth-request.interface';

export const AuthTokenHttp = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest() as AuthRequest;

        return req.auth.token;
    },
);
