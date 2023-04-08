import { Injectable } from '@nestjs/common';
import { ResponseDto } from '../../common/dto/response.dto';
import { UserDto } from './users.dto';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
    UsersGetByIdGatewayRouteInput,
    UsersGetByUsernameGatewayRouteInput,
} from './users.gateway.input';

@Injectable()
export class UsersGatewayService {
    constructor(private readonly prisma: PrismaService) {}

    public async getByIdRoute({ id }: UsersGetByIdGatewayRouteInput) {
        const user = await this.prisma.user.findUnique({
            where: {
                id,
            },
        });

        if (!user) {
            return new ResponseDto({
                code: -1,
                message: 'User not found',
            });
        }

        return new ResponseDto({
            code: 1,
            response: new UserDto({
                id: user.id,
                username: user.username,
            }),
        });
    }

    public async getByUsernameRoute({
        username,
    }: UsersGetByUsernameGatewayRouteInput) {
        const user = await this.prisma.user.findUnique({
            where: {
                username,
            },
        });

        if (!user) {
            return new ResponseDto({
                code: -1,
                message: 'User not found',
            });
        }

        return new ResponseDto({
            code: 1,
            response: new UserDto({
                id: user.id,
                username: user.username,
            }),
        });
    }
}
