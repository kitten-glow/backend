import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { RequestException } from '../exceptions/request.exception';

@Injectable()
export class ValidateEmailPipe implements PipeTransform {
    public transform(value: any, metadata: ArgumentMetadata) {
        const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/i;

        if (regex.test(value)) {
            throw new RequestException({
                code: -301,
                message: `Field "${metadata?.data}" isn't email`,
            });
        }

        return true;
    }
}
