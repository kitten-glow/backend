import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { RequestException } from '../exceptions/request.exception';

@Injectable()
export class ParseBooleanPipe implements PipeTransform {
    public transform(value: string, metadata: ArgumentMetadata): boolean {
        if (value === undefined) return;

        switch (value) {
            case 'true':
            case '1':
                return true;
            case 'false':
            case '0':
                return false;
            default:
                return undefined;
        }
    }
}
