import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { RequestException } from '../exceptions/request.exception';

@Injectable()
export class ParseIntPipe implements PipeTransform {
    public transform(value: any, metadata: ArgumentMetadata) {
        if (value === undefined) return;

        const number = parseInt(value.toString());

        if (isNaN(number)) {
            throw new RequestException({
                code: -301,
                message: `Field "${metadata?.data}" isn't integer`,
            });
        }

        return number;
    }
}
