import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { AuthGatewayService } from './auth.gateway.service';

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PrismaModule, UsersModule],
            providers: [AuthGatewayService, AuthService],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('token is generating correctly', async () => {
        const token = await service.generateToken();

        expect(token).toBeDefined();
        expect(token.length).toBe(90);
    });

    it('password is hashing correctly', async () => {
        const plainPassword = 'test_password';

        const hashedPassword = await service.hashPassword(plainPassword);
        expect(hashedPassword).toBeDefined();

        const comparedPassword = await service.verifyPassword(plainPassword, hashedPassword);
        expect(comparedPassword).toBe(true);
    });
});
