import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { UsersService } from './users.service';
import { UsersGatewayService } from './users.gateway.service';
import { UserRepository } from '../../repositories/user.repository';

describe('UsersController', () => {
    let controller: UsersController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PrismaModule],
            providers: [UsersGatewayService, UsersService, UserRepository],
            controllers: [UsersController],
        }).compile();

        controller = module.get<UsersController>(UsersController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
