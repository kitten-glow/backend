import { ArgumentMetadata } from '@nestjs/common';
import { ParseIntPipe } from './parse-int.pipe';

describe('ParseIntPipe', () => {
    it('should be defined', () => {
        expect(new ParseIntPipe()).toBeDefined();
    });

    it('is int parsing', () => {
        const pipe = new ParseIntPipe();

        const metadata: ArgumentMetadata = {
            type: 'query',
            data: 'int',
        };

        expect(pipe.transform('100', metadata)).toBe(100);

        expect(() => pipe.transform('invalid', metadata)).toThrow();
    });
});
