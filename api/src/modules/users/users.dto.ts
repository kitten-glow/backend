import { Expose } from 'class-transformer';

export class UserDto {
    constructor(partial: UserDto) {
        Object.assign(this, partial);
    }

    @Expose()
    public id: number;

    @Expose()
    public username: string;
}
