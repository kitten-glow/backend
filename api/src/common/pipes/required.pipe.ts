import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { RequestException } from '../exceptions/request.exception';

@Injectable()
export class RequiredPipe implements PipeTransform {
    public transform(value: any, metadata: ArgumentMetadata) {
        if (!value) {
            throw new RequestException({
                code: -300,
                message: `Field "${metadata?.data}" is required`,
            });
        }

        return value;
    }
}
