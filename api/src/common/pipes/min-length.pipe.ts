import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { RequestException } from '../exceptions/request.exception';

@Injectable()
export class MinLengthPipe implements PipeTransform {
    constructor(private readonly min: number) {}

    public transform(value: string, metadata: ArgumentMetadata) {
        if (value.length < this.min) {
            throw new RequestException({
                code: -301,
                message: `Min length for field "${metadata?.data}" is ${this.min}`,
            });
        }

        return value;
    }
}
