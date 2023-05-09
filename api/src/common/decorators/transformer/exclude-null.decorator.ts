import { Transform } from 'class-transformer';

export function ExcludeNull() {
    return Transform(({ value }) => (value === null ? value?.trim() : value));
}
