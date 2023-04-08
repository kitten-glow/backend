import { Injectable } from '@nestjs/common';
import {
    ParticipantInStatus,
    ServiceMessageType,
    Conversation,
} from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
    MessagesDeleteRouteInput,
    MessagesGetListRouteInput,
    MessagesGetPinnedRouteInput,
    MessagesMarkAsReadRouteInput,
    MessagesPinRouteInput,
    MessagesSendRouteInput,
} from './messages.gateway.input';
import { MessageDto } from './messages.dto';
import { SERVICE_MESSAGE_INCLUDE_DATA } from '../../common/constants/service-message-include-data.constant';
import { ResponseDto } from '../../common/dto/response.dto';

@Injectable()
export class MessagesGatewayService {
    constructor(private readonly prisma: PrismaService) {}

    // роут непростой и один из самых важных в приложении.
    // вопрос с архитектурой решается
    public async sendRoute({
        user,
        conversationId,
        userId,
        content,
        silent,
    }: MessagesSendRouteInput) {
        if (!conversationId && !userId) {
            return 0;
        }

        let conversation: Conversation;

        // всякие формальности при отправке сообщения пользователю по его id
        if (userId) {
            // сразу нужно отметить
            // userId - тот, С КЕМ ведется диалог
            // user.id - тот, кто ОТПРАВЛЯЕТ запрос

            // здесь мы проверяем, есть ли уже диалог с этим пользователем.
            // если нет, нужно его создать, а потом уже отправлять сообщение
            const privateConversation =
                await this.prisma.privateConversation.findFirst({
                    where: {
                        participants: {
                            every: {
                                participant: {
                                    status: ParticipantInStatus.IN,
                                    ban: null,
                                    AND: [
                                        {
                                            userId: user.id,
                                        },
                                        {
                                            userId: userId,
                                        },
                                    ],
                                },
                            },
                        },
                    },
                });

            // создаем все что нужно для отправки сообщения
            if (!privateConversation) {
                const chatUser = await this.prisma.user.findUnique({
                    where: {
                        id: userId,
                    },
                });

                if (!chatUser) {
                    return 0;
                }

                const newConversation = await this.prisma.conversation.create({
                    data: {
                        privateConversation: {
                            create: {},
                        },
                    },
                    include: {
                        privateConversation: true,
                    },
                });

                conversation = newConversation;

                // ниже создаются участники для приватного чата.
                //
                // что за хрень?? почему нельзя сунуть все в createMany?
                //
                // нам нужно сделать вложенным запросом participant и
                // privateConversationParticipant
                // проще всего сделать это так, как уже есть..

                // создаем первого участника
                await this.prisma.participant.create({
                    data: {
                        userId: user.id,
                        conversationId: newConversation.id,
                        privateConversationParticipant: {
                            create: {
                                privateConversationId:
                                    newConversation.privateConversation.id,
                            },
                        },
                    },
                });

                // создаем второго участника
                await this.prisma.participant.create({
                    data: {
                        userId: userId,
                        conversationId: newConversation.id,
                        privateConversationParticipant: {
                            create: {
                                privateConversationId:
                                    newConversation.privateConversation.id,
                            },
                        },
                    },
                });

                // finally, сообщение о том, что чат создан
                await this.prisma.message.create({
                    data: {
                        conversationId: newConversation.id,
                        serviceMessage: {
                            create: {
                                type: ServiceMessageType.CONVERSATION_CREATED,
                                serviceMessageConversationCreated: {
                                    create: {
                                        conversationId: newConversation.id,
                                        byUserId: user.id,
                                    },
                                },
                            },
                        },
                    },
                });
            }
        }

        // при отправке сообщения в чат (необязательно групповой) по его id
        if (conversationId) {
            const groupConversation =
                await this.prisma.groupConversation.findFirst({
                    where: {
                        conversationId,
                        participants: {
                            some: {
                                participant: {
                                    status: ParticipantInStatus.IN,
                                    ban: null,
                                    userId: user.id,
                                },
                            },
                        },
                    },
                    include: {
                        conversation: true,
                    },
                });

            if (!groupConversation) {
                return 0;
            }

            conversation = groupConversation.conversation;
        }

        // конец формальностей с наличием чатов
        // начинаем уже нормально работать

        // транзакция, так как без обновления айди последнего сообщения, все упадет
        const lastMessage = await this.prisma.$transaction(async (tx) => {
            const message = await tx.message.create({
                data: {
                    conversationId: conversation.id,
                    content,
                },
                include: {
                    attachments: true,
                },
            });

            await tx.conversation.update({
                where: {
                    id: conversation.id,
                },
                data: {
                    lastMessageId: message.id,
                },
            });

            return message;
        });

        await this.prisma.participant.update({
            where: {
                userId_conversationId: {
                    userId: user.id,
                    conversationId: conversation.id,
                },
            },
            data: {
                lastSeenMessage: lastMessage.id,
            },
        });

        return new ResponseDto({
            code: 1,
            response: new MessageDto({
                id: lastMessage.id,
                content: lastMessage.content,
                conversationId: lastMessage.conversationId,
                senderId: lastMessage.senderId,
                pinned: lastMessage.pinned,
                attachments: lastMessage.attachments,
            }),
        });
    }

    public async getListRoute({
        user,
        conversationId,
        userId,
        offset,
        count,
        startMessageId,
        reversed,
    }: MessagesGetListRouteInput) {
        if (!conversationId && !userId) {
            return 0;
        }

        const participant = await this.prisma.participant.findFirst({
            where: {
                status: ParticipantInStatus.IN,
                ban: null,
                userId: user.id,
                conversation: {
                    id: conversationId ? conversationId : undefined,
                    privateConversation: userId
                        ? {
                              userIds: {
                                  hasEvery: [user.id, userId],
                              },
                          }
                        : undefined,
                },
            },
            include: {
                conversation: true,
            },
        });

        if (!participant) {
            return 0;
        }

        const messages = await this.prisma.message.findMany({
            where: {
                conversationId,
                deleted: false,
            },
            include: {
                serviceMessage: {
                    include: SERVICE_MESSAGE_INCLUDE_DATA,
                },
                attachments: true,
            },
            skip: offset,
            take: !reversed ? count : -count,
            cursor: startMessageId
                ? {
                      id: startMessageId,
                  }
                : undefined,
        });

        // ничего странного
        if (!reversed) {
            messages.reverse();
        }

        return new ResponseDto({
            code: 1,
            response: messages.map((message) => {
                return new MessageDto({
                    id: message.id,
                    content: message.content,
                    conversationId: message.conversationId,
                    senderId: message.senderId,
                    pinned: message.pinned,
                    attachments: message.attachments,
                });
            }),
        });
    }

    public async markAsReadRoute({
        user,
        messageId,
    }: MessagesMarkAsReadRouteInput) {
        const participant = await this.prisma.participant.findFirst({
            where: {
                status: ParticipantInStatus.IN,
                ban: null,
                userId: user.id,
                conversation: {
                    messages: {
                        some: {
                            id: messageId,
                        },
                    },
                },
            },
            select: {
                id: true,
                lastSeenMessage: true,
            },
        });

        if (!participant) {
            return 0;
        }

        if (participant.lastSeenMessage > messageId) {
            return 0;
        }

        await this.prisma.participant.update({
            where: {
                id: participant.id,
            },
            data: {
                lastSeenMessage: messageId,
            },
        });

        return new ResponseDto({
            code: 1,
            response: true,
        });
    }

    public async pinRoute({ user, messageId }: MessagesPinRouteInput) {
        const participant = await this.prisma.participant.findFirst({
            where: {
                status: ParticipantInStatus.IN,
                ban: null,
                userId: user.id,
                conversation: {
                    messages: {
                        some: {
                            id: messageId,
                            deleted: false,
                        },
                    },
                },
                // todo описать права на использование таких приколдесов
                OR: [
                    {
                        privateConversationParticipant: {
                            isNot: undefined,
                        },
                    },
                    {
                        groupConversationParticipant: {
                            isNot: undefined,
                        },
                    },
                ],
            },
            include: {
                conversation: {
                    include: {
                        messages: {
                            where: {
                                id: messageId,
                            },
                        },
                    },
                },
            },
        });

        if (!participant) {
            return 0;
        }

        const { conversation } = participant;
        const [message] = conversation.messages;

        if (message.pinned) {
            return 0;
        }

        await this.prisma.message.update({
            where: {
                id: messageId,
            },
            data: {
                pinned: true,
            },
        });

        const lastMessage = await this.prisma.message.create({
            data: {
                conversationId: conversation.id,
                serviceMessage: {
                    create: {
                        type: ServiceMessageType.MESSAGE_PINNED,
                        serviceMessagePinned: {
                            create: {
                                messageId,
                                conversationId: conversation.id,
                                byUserId: user.id,
                            },
                        },
                    },
                },
            },
        });

        await this.prisma.conversation.update({
            where: {
                id: conversation.id,
            },
            data: {
                lastMessageId: lastMessage.id,
            },
        });

        return new ResponseDto({
            code: 1,
            response: true,
        });
    }

    public async getPinnedRoute({
        user,
        conversationId,
    }: MessagesGetPinnedRouteInput) {
        const { conversation } = await this.prisma.participant.findFirst({
            where: {
                status: ParticipantInStatus.IN,
                ban: null,
                conversationId,
                userId: user.id,
            },
            include: {
                conversation: {
                    include: {
                        messages: {
                            where: {
                                deleted: false,
                                pinned: true,
                            },
                            include: {
                                serviceMessage: {
                                    include: SERVICE_MESSAGE_INCLUDE_DATA,
                                },
                                attachments: true,
                            },
                        },
                    },
                },
            },
        });

        if (!conversation) {
            return 0;
        }

        return new ResponseDto({
            code: 1,
            response: conversation.messages.map((message) => {
                return new MessageDto({
                    id: message.id,
                    content: message.content,
                    conversationId: message.conversationId,
                    senderId: message.senderId,
                    pinned: message.pinned,
                    attachments: message.attachments,
                    serviceMessage: message.serviceMessage,
                });
            }),
        });
    }

    public async deleteRoute({ user, messageId }: MessagesDeleteRouteInput) {
        const participant = await this.prisma.participant.findFirst({
            where: {
                status: ParticipantInStatus.IN,
                ban: null,
                userId: user.id,
                conversation: {
                    messages: {
                        some: {
                            id: messageId,
                            senderId: user.id,
                            deleted: false,
                        },
                    },
                },
            },
        });

        if (!participant) {
            return 0;
        }

        await this.prisma.$transaction(async (tx) => {
            await tx.message.update({
                where: {
                    id: messageId,
                },
                data: {
                    deleted: true,
                },
            });

            const lastMessage = await tx.message.findFirst({
                where: {
                    conversationId: participant.conversationId,
                    deleted: false,
                },
                orderBy: {
                    id: 'desc',
                },
            });

            await tx.conversation.update({
                where: {
                    id: participant.conversationId,
                },
                data: {
                    lastMessageId: lastMessage.id,
                },
            });

            await tx.participant.updateMany({
                where: {
                    conversationId: participant.conversationId,
                    lastSeenMessage: messageId,
                },
                data: {
                    lastSeenMessage: lastMessage.id,
                },
            });
        });

        return new ResponseDto({
            code: 1,
            response: true,
        });
    }
}
