import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class DefaultValuePipe implements PipeTransform {
    constructor(private readonly value: unknown) {}

    public transform(value: unknown, metadata: ArgumentMetadata) {
        return value ?? this.value;
    }
}
