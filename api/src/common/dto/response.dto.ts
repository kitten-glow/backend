export class ResponseDto<T = undefined> {
    public readonly code: number;

    public readonly response?: T;

    public readonly message?: string;

    constructor(partial: Partial<ResponseDto<T>>) {
        Object.assign(this, partial);
    }
}
