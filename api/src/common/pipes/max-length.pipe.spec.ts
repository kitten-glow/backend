import { MaxLengthPipe } from './max-length.pipe';

describe('MaxLengthPipe', () => {
    it('should be defined', () => {
        expect(new MaxLengthPipe(0)).toBeDefined();
    });
});
