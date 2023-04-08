import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { RequestException } from '../exceptions/request.exception';

@Injectable()
export class ParseBooleanPipe implements PipeTransform {
    public transform(value: string, metadata: ArgumentMetadata): boolean {
        if (value === undefined) return;

        switch (value) {
            case '1' || 'true':
                return true;
            case '0' || 'false':
                return false;
            default:
                return undefined;
        }
    }
}
