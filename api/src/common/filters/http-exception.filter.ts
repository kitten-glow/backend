import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RequestException } from '../exceptions/request.exception';
import { Response } from 'express';

@Catch(RequestException)
export class HttpExceptionFilter implements ExceptionFilter {
    public catch(exception: RequestException, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse() as Response;

        response.statusCode = 500;

        response.json(exception);
    }
}
