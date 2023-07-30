import { DefaultValuePipe } from './default-value.pipe';

describe('DefaultValuePipe', () => {
    it('should be defined', () => {
        expect(new DefaultValuePipe(0)).toBeDefined();
    });
});
