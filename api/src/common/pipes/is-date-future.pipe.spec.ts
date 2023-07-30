import { IsDateFuturePipe } from './is-date-future.pipe';
import { ArgumentMetadata } from '@nestjs/common';
import { DateTime, Duration } from 'luxon';

describe('IsDateFuturePipe', () => {
    const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: Date,
        data: '',
    };

    it('success pipe', () => {
        const target = new IsDateFuturePipe();
        const futureDate = DateTime.now().plus({ day: 1 }).toJSDate();

        const result = target.transform(futureDate, metadata);

        expect(result).toBeDefined();
    });

    it('failed pipe', () => {
        const target = new IsDateFuturePipe();
        const futureDate = DateTime.now().minus({ day: 1 }).toJSDate();

        const result = target.transform(futureDate, metadata);

        expect(result).toBeUndefined();
    });
});
