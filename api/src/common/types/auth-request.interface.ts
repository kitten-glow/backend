import { Request } from 'express';
import { Token, User } from '@prisma/client';

export interface AuthRequest extends Request {
    auth: {
        token: Token;
        user: User;
    };
}
