import { Expose, Transform, TransformFnParams, Type } from 'class-transformer';
import { ServiceMessage, ServiceMessageType } from '@prisma/client';

export function ExcludeNull() {
    return Transform(({ value }) => (value === null ? value?.trim() : value));
}

// можно использовать только тогда, когда в дто осознанно
// добавляются специальные поля, и никакие другие больше не нужны
//
// например, случай с createGroup. из всех полей там нужно только
// одно - serviceMessageConversationCreated, а остальные забиваются
// нулями с помощью константы EMPTY_SERVICE_MESSAGE_DTO
export const EMPTY_SERVICE_MESSAGE_DTO: ServiceMessageDto = {
    type: null,
    serviceMessageLeftConversation: null,
    serviceMessageAddedToConversation: null,
    serviceMessageRemovedFromConversation: null,
    serviceMessageConversationTitleChanged: null,
    serviceMessageConversationAvatarChanged: null,
    serviceMessageConversationHistoryCleared: null,
    serviceMessageConversationCreated: null,
    serviceMessagePinned: null,
    serviceMessageUnpinned: null,
};

export class ServiceMessageDto {
    constructor(partial: ServiceMessageDto) {
        Object.assign(this, partial);
    }

    @Expose()
    public type: ServiceMessageType;

    @Expose()
    @ExcludeNull()
    public serviceMessageLeftConversation: unknown;

    @Expose()
    @ExcludeNull()
    public serviceMessageAddedToConversation: unknown;

    @Expose()
    @ExcludeNull()
    public serviceMessageRemovedFromConversation: unknown;

    @Expose()
    @ExcludeNull()
    public serviceMessageConversationTitleChanged: unknown;

    @Expose()
    @ExcludeNull()
    public serviceMessageConversationAvatarChanged: unknown;

    @Expose()
    @ExcludeNull()
    public serviceMessageConversationHistoryCleared: unknown;

    @Expose()
    @ExcludeNull()
    public serviceMessageConversationCreated: unknown;

    @Expose()
    @ExcludeNull()
    public serviceMessagePinned: unknown;

    @Expose()
    @ExcludeNull()
    public serviceMessageUnpinned: unknown;
}

export class MessageDto {
    constructor(partial: MessageDto) {
        Object.assign(this, partial);
    }

    @Expose()
    public id: number;

    @Expose()
    public content: string | null;

    @Expose()
    public conversationId: number;

    @Expose()
    public senderId: number;

    @Expose()
    public pinned: boolean;

    @Expose()
    public attachments: any[];

    @Expose()
    @Type(() => ServiceMessageDto)
    public serviceMessage?: ServiceMessageDto;
}
