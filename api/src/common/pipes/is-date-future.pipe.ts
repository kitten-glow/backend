import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { DateTime } from 'luxon';

@Injectable()
export class IsDateFuturePipe implements PipeTransform {
    public transform(value: Date, metadata: ArgumentMetadata) {
        const isFuture = DateTime.fromJSDate(value).diffNow().toMillis() > 1;

        return isFuture ? value : undefined;
    }
}
