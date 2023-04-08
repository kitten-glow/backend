import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { AuthGatewayService } from './auth.gateway.service';

@Global()
@Module({
    imports: [PrismaModule, UsersModule],
    providers: [AuthGatewayService, AuthService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}
