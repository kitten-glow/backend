import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { promisify } from 'util';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService) {}

    public verifyPassword(plain: string, hash: string) {
        return bcrypt.compare(plain, hash);
    }

    public hashPassword(password: string) {
        return bcrypt.hash(password, 10);
    }

    public async generateToken() {
        const randomBytes = promisify(crypto.randomBytes);

        const token = await randomBytes(45);

        return token.toString('hex');
    }

    public async authByToken(token: string) {
        const tokenInDatabase = await this.prisma.token.findUnique({
            where: {
                token,
            },
        });

        if (!tokenInDatabase) throw new Error("Token doesn't exist");

        const userInDatabase = await this.prisma.user.findUnique({
            where: {
                id: tokenInDatabase.userId,
            },
        });

        return {
            token: tokenInDatabase,
            user: userInDatabase,
        };
    }
}
