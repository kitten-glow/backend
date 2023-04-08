import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform {
    public transform(value: unknown, metadata: ArgumentMetadata) {
        return new Date(value?.toString?.());
    }
}
