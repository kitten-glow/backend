import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { RequestException } from '../exceptions/request.exception';

@Injectable()
export class MaxLengthPipe implements PipeTransform {
    constructor(private readonly max: number) {}

    public transform(value: string, metadata: ArgumentMetadata) {
        if (value.length > this.max) {
            throw new RequestException({
                code: -301,
                message: `Max length for field "${metadata?.data}" is ${this.max}`,
            });
        }

        return value;
    }
}
