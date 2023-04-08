import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../../../modules/auth/auth.service';
import { AuthRequest } from '../../types/auth-request.interface';
import { RequestException } from '../../exceptions/request.exception';

@Injectable()
export class AuthHttpGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    public async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest<AuthRequest>();
        const token = request.query?.token?.toString()?.toLowerCase();

        try {
            request.auth = await this.authService.authByToken(token);
        } catch (e) {
            throw new RequestException({
                code: -200,
                message: `Invalid token`,
            });
        }

        return true;
    }
}
