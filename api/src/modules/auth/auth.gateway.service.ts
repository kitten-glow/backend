import { Injectable } from '@nestjs/common';
import { UserDto } from '../users/users.dto';
import { AuthService } from './auth.service';
import { ResponseDto } from '../../common/dto/response.dto';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AuthLoginGatewayRouteInput } from './auth.gateway.input';
import { TokenAndUserDto, TokenDto } from './auth.dto';

@Injectable()
export class AuthGatewayService {
    constructor(private readonly prisma: PrismaService, private readonly authService: AuthService) {}

    public async loginRoute({ username, password }: AuthLoginGatewayRouteInput) {
        const user = await this.prisma.user.findUnique({
            where: {
                username,
            },
        });

        if (!user) {
            return new ResponseDto({
                code: -1,
                message: "User doesn't exist",
            });
        }

        const isPasswordCorrect = this.authService.verifyPassword(password, user.password);

        if (!isPasswordCorrect) {
            return new ResponseDto({
                code: -2,
                message: 'Password is wrong',
            });
        }

        const generatedToken = await this.authService.generateToken();

        const token = await this.prisma.token.create({
            data: {
                userId: user.id,
                token: generatedToken,
            },
        });

        return new ResponseDto({
            code: 1,
            response: new TokenAndUserDto({
                token: new TokenDto({
                    id: token.id,
                    userId: token.userId,
                    token: token.token,
                }),
                user: new UserDto({
                    id: user.id,
                    username: user.username,
                }),
            }),
        });
    }

    public async registerRoute({ username, password }) {}
}
