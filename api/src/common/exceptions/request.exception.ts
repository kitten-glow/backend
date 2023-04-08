export class RequestException {
    public readonly code: number;
    public readonly message: string;

    constructor(partial: Partial<RequestException>) {
        Object.assign(this, partial);
    }
}
