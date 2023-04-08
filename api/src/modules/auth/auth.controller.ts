import { Controller, Get, Query } from '@nestjs/common';
import { AuthGatewayService } from './auth.gateway.service';
import { RequiredPipe } from '../../common/pipes/required.pipe';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authGatewayService: AuthGatewayService) {}

    @Get('login')
    public login(
        @Query('username', RequiredPipe) username: string,
        @Query('password', RequiredPipe) password: string,
    ) {
        return this.authGatewayService.loginRoute({ username, password });
    }
}
