import { MinLengthPipe } from './min-length.pipe';

describe('MinLengthPipe', () => {
    it('should be defined', () => {
        expect(new MinLengthPipe(0)).toBeDefined();
    });
});
