import { UserDto } from '../users/users.dto';
import { Type } from 'class-transformer';

export class TokenDto {
    public id: number;

    public userId: number;

    public token: string;

    constructor(partial: Partial<TokenDto>) {
        Object.assign(this, partial);
    }
}

export class TokenAndUserDto {
    @Type(() => TokenDto)
    public token: TokenDto;

    @Type(() => UserDto)
    public user: UserDto;

    constructor(partial: Partial<TokenAndUserDto>) {
        Object.assign(this, partial);
    }
}
