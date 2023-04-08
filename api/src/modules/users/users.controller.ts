import { Controller, Get, Query } from '@nestjs/common';
import { UsersGatewayService } from './users.gateway.service';
import { RequiredPipe } from '../../common/pipes/required.pipe';
import { ParseIntPipe } from '../../common/pipes/parse-int.pipe';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersGatewayService: UsersGatewayService) {}

    @Get('getById')
    public getById(@Query('id', RequiredPipe, ParseIntPipe) id: number) {
        return this.usersGatewayService.getByIdRoute({ id });
    }

    @Get('getByUsername')
    public getByUsername(@Query('username', RequiredPipe) username: string) {
        return this.usersGatewayService.getByUsernameRoute({ username });
    }
}
