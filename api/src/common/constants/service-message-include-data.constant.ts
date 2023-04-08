import { Prisma } from '@prisma/client';

export const SERVICE_MESSAGE_INCLUDE_DATA: Required<Prisma.ServiceMessageInclude> = {
    message: false,
    serviceMessageLeftConversation: true,
    serviceMessageAddedToConversation: true,
    serviceMessageRemovedFromConversation: true,
    serviceMessageConversationTitleChanged: true,
    serviceMessageConversationAvatarChanged: true,
    serviceMessageConversationHistoryCleared: true,
    serviceMessageConversationCreated: true,
    serviceMessagePinned: true,
    serviceMessageUnpinned: true,
};
