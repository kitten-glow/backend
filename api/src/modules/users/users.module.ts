import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { UsersGatewayService } from './users.gateway.service';

@Module({
    imports: [PrismaModule],
    providers: [UsersService, UsersGatewayService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule {}
