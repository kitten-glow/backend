import { Injectable } from '@nestjs/common';
import {
    ConversationsCreateGroupRouteInput,
    ConversationsCreateInviteLinkRouteInput,
    ConversationsEditPermissionsRouteInput,
    ConversationsGetListRouteInput,
    ConversationsGetMyPermissionsRouteInput,
    ConversationsGetParticipantsRouteInput,
    ConversationsJoinInviteLinkRouteInput,
    ConversationsPreviewInviteLinkRouteInput,
    ConversationsSetTitleRouteInput,
} from './conversations.gateway.input';
import { ParticipantInStatus, Prisma, ServiceMessageType } from '@prisma/client';
import { SERVICE_MESSAGE_INCLUDE_DATA } from '../../common/constants/service-message-include-data.constant';
import {
    ConversationDto,
    GroupConversationDto,
    GroupConversationPermissionsDto,
    InviteLinkDto,
    ParticipantDto,
    PreviewInviteLinkDto,
    PrivateConversationDto,
} from './conversations.dto';
import { EMPTY_SERVICE_MESSAGE_DTO, MessageDto, ServiceMessageDto } from '../messages/messages.dto';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { ConversationsService } from './conversations.service';
import { RequestException } from '../../common/exceptions/request.exception';
import { UserDto } from '../users/users.dto';
import { ResponseDto } from '../../common/dto/response.dto';
import { DateTime } from 'luxon';

@Injectable()
export class ConversationsGatewayService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly conversationsService: ConversationsService,
    ) {}

    public async getListRoute({ user, count, offset }: ConversationsGetListRouteInput) {
        const participants = await this.prisma.$queryRaw<{ conversationId: number; unreadCount: number }[]>`
            SELECT 
                "conversationId",
                "lastSeenMessage",
                (
                    SELECT COUNT(1)::int AS "unreadCount"
                    FROM "Message" "_message"
                    WHERE "_message"."id" > "lastSeenMessage"
                    AND "_message"."conversationId" = "_participant"."conversationId"
                ) AS "unreadCount"
            FROM "Participant" AS "_participant"
            WHERE "userId" = ${user.id} 
                AND "_participant"."status" = '${Prisma.raw(ParticipantInStatus.IN)}' 
                AND NOT EXISTS (
                    SELECT 1
                    FROM "ParticipantBan" "_participantBan"
                    WHERE "_participantBan"."id" = "_participant"."id"
                )
        `;

        const conversations = await this.prisma.conversation.findMany({
            where: {
                id: {
                    in: participants.map((item) => item.conversationId),
                },
            },
            orderBy: {
                lastMessageId: 'desc',
            },
            skip: offset,
            take: count,
            include: {
                groupConversation: true,
                privateConversation: true,
            },
        });

        const lastMessages = await this.prisma.message.findMany({
            where: {
                id: {
                    in: conversations.map((conversation) => conversation.lastMessageId),
                },
                deleted: false,
            },
            include: {
                attachments: true,
                serviceMessage: {
                    include: SERVICE_MESSAGE_INCLUDE_DATA,
                },
            },
        });

        const userIds = conversations
            .filter((conversation) => !!conversation.privateConversation)
            .map((conversation) => conversation.privateConversation.userIds)
            .map((userIds) => userIds.find((userId) => userId !== user.id));

        const users = await this.prisma.user.findMany({
            where: {
                id: {
                    in: userIds,
                },
            },
        });

        return new ResponseDto({
            code: 1,
            response: conversations.map((conversation) => {
                const { groupConversation, privateConversation } = conversation;
                const unreadCount = participants.find(
                    (participant) => participant.conversationId === conversation.id,
                ).unreadCount;
                const lastMessage = lastMessages.find(
                    (message) => message.conversationId === conversation.id,
                );
                const user = privateConversation
                    ? users.find((user) => privateConversation.userIds.includes(user.id))
                    : null;
                const title = privateConversation ? user.username : conversation.groupConversation.title;

                return new ConversationDto({
                    id: conversation.id,
                    title,
                    unreadCount,
                    groupConversation: groupConversation
                        ? new GroupConversationDto({
                              title: groupConversation.title,
                          })
                        : null,
                    privateConversation: privateConversation
                        ? new PrivateConversationDto({
                              user: new UserDto({
                                  id: user.id,
                                  username: user.username,
                              }),
                          })
                        : null,
                    lastMessage: new MessageDto({
                        id: lastMessage.id,
                        content: lastMessage.content,
                        conversationId: lastMessage.conversationId,
                        senderId: lastMessage.senderId,
                        pinned: lastMessage.pinned,
                        attachments: lastMessage.attachments,
                        serviceMessage: lastMessage.serviceMessage
                            ? new ServiceMessageDto({
                                  ...lastMessage.serviceMessage,
                              })
                            : null,
                    }),
                });
            }),
        });
    }

    public async createGroupRoute({ user, title }: ConversationsCreateGroupRouteInput) {
        const conversation = await this.prisma.conversation.create({
            data: {
                groupConversation: {
                    create: {
                        title,
                        permissions: {
                            create: {},
                        },
                    },
                },
            },
            include: {
                groupConversation: true,
            },
        });

        const participant = await this.prisma.participant.create({
            data: {
                userId: user.id,
                conversationId: conversation.id,
                groupConversationParticipant: {
                    create: {
                        groupConversationId: conversation.groupConversation.id,
                        admin: {
                            create: {
                                isOwner: true,
                            },
                        },
                    },
                },
            },
        });

        const lastMessage = await this.prisma.message.create({
            data: {
                conversationId: conversation.id,
                serviceMessage: {
                    create: {
                        type: ServiceMessageType.CONVERSATION_CREATED,
                        serviceMessageConversationCreated: {
                            create: {
                                conversationId: conversation.id,
                                byUserId: user.id,
                            },
                        },
                    },
                },
            },
            include: {
                attachments: true,
                serviceMessage: {
                    include: {
                        serviceMessageConversationCreated: true,
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

        await this.prisma.participant.update({
            where: {
                id: participant.id,
            },
            data: {
                lastSeenMessage: lastMessage.id,
            },
        });

        return new ResponseDto({
            code: 1,
            response: new ConversationDto({
                id: conversation.id,
                unreadCount: 0,
                title: conversation.groupConversation.title,
                groupConversation: new GroupConversationDto({
                    title: conversation.groupConversation.title,
                }),
                privateConversation: null,
                lastMessage: new MessageDto({
                    id: lastMessage.id,
                    content: lastMessage.content,
                    conversationId: lastMessage.conversationId,
                    senderId: lastMessage.senderId,
                    pinned: lastMessage.pinned,
                    attachments: lastMessage.attachments,
                    serviceMessage: new ServiceMessageDto({
                        ...EMPTY_SERVICE_MESSAGE_DTO,
                        type: lastMessage.serviceMessage.type,
                        serviceMessageConversationCreated:
                            lastMessage.serviceMessage.serviceMessageConversationCreated,
                    }),
                }),
            }),
        });
    }

    public async createInviteLinkRoute({
        user,
        conversationId,
        name,
        needAdminApprove,
        expireDate,
        memberLimit,
    }: ConversationsCreateInviteLinkRouteInput) {
        const participant = await this.prisma.participant.findFirst({
            where: {
                conversationId,
                userId: user.id,
                status: ParticipantInStatus.IN,
                ban: null,
            },
        });

        if (!participant) {
            throw new RequestException({
                code: -1,
                message: 'Chat not found',
            });
        }

        const generatedLink = this.conversationsService.generateInviteLink();

        const newLink = await this.prisma.conversationInviteLink.create({
            data: {
                conversationId,
                inviteLink: generatedLink,
                name: name || generatedLink,
                expireDate: expireDate || null,
                needAdminApprove,
                memberLimit,
                createdBy: user.id,
            },
        });

        return new ResponseDto({
            code: 1,
            response: new InviteLinkDto({
                conversationId,
                inviteLink: generatedLink,
                name: name || generatedLink,
                expireDate: expireDate || null,
                needAdminApprove,
                memberLimit,
                createdBy: user.id,
                createdAt: newLink.createdAt,
            }),
        });
    }

    public async previewInviteLinkRoute({ inviteLink }: ConversationsPreviewInviteLinkRouteInput) {
        const link = await this.prisma.conversationInviteLink.findUnique({
            where: {
                inviteLink,
            },
            include: {
                conversation: {
                    include: {
                        groupConversation: true,
                    },
                },
            },
        });

        if (!link) {
            throw new RequestException({
                code: -1,
                message: 'Link not found',
            });
        }

        const { conversation } = link;

        const membersCount = await this.prisma.participant.count({
            where: {
                conversationId: conversation.id,
                status: ParticipantInStatus.IN,
            },
        });

        return new ResponseDto({
            code: 1,
            response: new PreviewInviteLinkDto({
                id: conversation.id,
                title: conversation.groupConversation.title,
                membersCount,
            }),
        });
    }

    public async joinInviteLinkRoute({ user, inviteLink }: ConversationsJoinInviteLinkRouteInput) {
        const link = await this.prisma.conversationInviteLink.findUnique({
            where: {
                inviteLink,
            },
            include: {
                conversation: {
                    include: {
                        groupConversation: true,
                    },
                },
            },
        });

        if (!link) {
            return 0;
        }

        const { conversation } = link;

        const participant = await this.prisma.participant.findUnique({
            where: {
                userId_conversationId: {
                    userId: user.id,
                    conversationId: conversation.id,
                },
            },
            include: {
                ban: true,
            },
        });

        // я ненавижу такие конструкции, но по другому уже не хочу думать
        //
        // отсеиваем пользователей:
        // а) уже в чате
        // б) которых вышвырнули из чата
        // в) отдыхают в русской бане
        if (
            participant?.status === ParticipantInStatus.IN ||
            participant?.status === ParticipantInStatus.KICKED ||
            !!participant?.ban
        ) {
            return 0;
        }

        const lastMessage = await this.prisma.$transaction(async (tx) => {
            const message = await tx.message.create({
                data: {
                    conversationId: conversation.id,
                    serviceMessage: {
                        create: {
                            type: ServiceMessageType.ADDED_TO_CONVERSATION,
                            serviceMessageAddedToConversation: {
                                create: {
                                    conversationId: conversation.id,
                                    userId: user.id,
                                },
                            },
                        },
                    },
                },
                include: {
                    attachments: true,
                    serviceMessage: {
                        include: {
                            serviceMessageAddedToConversation: true,
                        },
                    },
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

        await this.prisma.participant.create({
            data: {
                userId: user.id,
                conversationId: conversation.id,
                joinedByLinkId: link.id,
                lastSeenMessage: lastMessage.id,
                groupConversationParticipant: {
                    create: {
                        groupConversationId: conversation.groupConversation.id,
                    },
                },
            },
        });

        return new ResponseDto({
            code: 1,
            response: new ConversationDto({
                id: conversation.id,
                title: conversation.groupConversation.title,
                unreadCount: 0,
                groupConversation: link.conversation.groupConversation
                    ? new GroupConversationDto({
                          title: conversation.groupConversation.title,
                      })
                    : null,
                lastMessage: new MessageDto({
                    id: lastMessage.id,
                    content: lastMessage.content,
                    conversationId: lastMessage.conversationId,
                    senderId: lastMessage.senderId,
                    pinned: lastMessage.pinned,
                    attachments: lastMessage.attachments,
                    serviceMessage: lastMessage.serviceMessage
                        ? new ServiceMessageDto({
                              ...SERVICE_MESSAGE_INCLUDE_DATA,
                              ...lastMessage.serviceMessage,
                          })
                        : null,
                }),
            }),
        });
    }

    public async setTitleRoute({ user, conversationId, title }: ConversationsSetTitleRouteInput) {
        const participant = await this.prisma.participant.findFirst({
            where: {
                userId: user.id,
                status: ParticipantInStatus.IN,
                ban: null,
                conversation: {
                    id: conversationId,
                },
            },
            include: {
                conversation: {
                    include: {
                        groupConversation: true,
                        privateConversation: true,
                    },
                },
            },
        });

        if (!participant) {
            throw new RequestException({
                code: -1,
                message: 'Chat not found',
            });
        }

        const { conversation } = participant;

        if (conversation.privateConversation) {
            return 0;
        }

        if (conversation.groupConversation) {
            await this.prisma.groupConversation.update({
                where: {
                    conversationId,
                },
                data: {
                    title,
                },
            });
        }

        const lastMessage = await this.prisma.$transaction(async (tx) => {
            const message = await tx.message.create({
                data: {
                    conversationId,
                    serviceMessage: {
                        create: {
                            type: ServiceMessageType.CONVERSATION_TITLE_CHANGED,
                            serviceMessageConversationTitleChanged: {
                                create: {
                                    conversationId,
                                    byUserId: user.id,
                                    title,
                                    oldTitle: conversation.groupConversation.title,
                                },
                            },
                        },
                    },
                },
                include: {
                    attachments: true,
                    serviceMessage: {
                        include: {
                            serviceMessageConversationTitleChanged: true,
                        },
                    },
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

        return new ResponseDto({
            code: 1,
            response: new MessageDto({
                id: lastMessage.id,
                content: lastMessage.content,
                conversationId: lastMessage.conversationId,
                senderId: lastMessage.senderId,
                pinned: lastMessage.pinned,
                serviceMessage: new ServiceMessageDto({
                    ...EMPTY_SERVICE_MESSAGE_DTO,
                    type: lastMessage.serviceMessage.type,
                    serviceMessageConversationTitleChanged:
                        lastMessage.serviceMessage.serviceMessageConversationTitleChanged,
                }),
                attachments: lastMessage.attachments,
            }),
        });
    }

    // todo: вынести в отдельный тестируемый модуль
    public async getMyPermissions({ user, conversationId }: ConversationsGetMyPermissionsRouteInput) {
        const participant = await this.prisma.participant.findFirst({
            where: {
                userId: user.id,
                status: ParticipantInStatus.IN,
                ban: null,
                conversation: {
                    id: conversationId,
                },
            },
            include: {
                groupConversationParticipant: {
                    include: {
                        admin: true,
                    },
                },
                conversation: {
                    include: {
                        groupConversation: {
                            include: {
                                permissions: {
                                    include: {
                                        exceptions: {
                                            where: {
                                                userId: user.id,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!participant) {
            throw new RequestException({
                code: -1,
                message: 'Chat not found',
            });
        }

        // роут важный. в чем суть:
        //
        // 1) проверяем сначала права админа. если true, то возвращаем его и
        // дальше уже идти нет смысла.
        // 2) смотрим пользователя с исключениями в правах, если исключение есть,
        // то отдаем это важное значение. если исключений нет, то пошлепали дальше
        // 3) просто уже даем значение из дефолтных прав пользователей в чате

        return new GroupConversationPermissionsDto({
            sendTextMessages:
                !!participant.groupConversationParticipant.admin ||
                (participant.conversation.groupConversation.permissions.exceptions[0]?.sendTextMessages ??
                    participant.conversation.groupConversation.permissions.sendTextMessages),
            changeGroupInfo:
                participant.groupConversationParticipant.admin?.changeGroupInfo ||
                (participant.conversation.groupConversation.permissions.exceptions[0]?.changeGroupInfo ??
                    participant.conversation.groupConversation.permissions.changeGroupInfo),
        });
    }

    public async editPermissionsRoute({
        user,
        conversationId,
        sendTextMessages,
        changeGroupInfo,
    }: ConversationsEditPermissionsRouteInput) {
        const participant = await this.prisma.participant.findFirst({
            where: {
                userId: user.id,
                status: ParticipantInStatus.IN,
                ban: null,
                conversation: {
                    id: conversationId,
                },
                groupConversationParticipant: {
                    admin: {
                        OR: [
                            {
                                isOwner: true,
                            },
                            {
                                editPermissions: true,
                            },
                        ],
                    },
                },
            },
            include: {
                conversation: {
                    include: {
                        groupConversation: true,
                    },
                },
            },
        });

        if (!participant) {
            throw new RequestException({
                code: -1,
                message: "Chat not found or you don't have permissions",
            });
        }

        const updatedPermissions = await this.prisma.groupConversationPermissions.update({
            where: {
                groupConversationId: participant.conversation.groupConversation.id,
            },
            data: {
                sendTextMessages,
                changeGroupInfo,
            },
        });

        return new GroupConversationPermissionsDto({
            sendTextMessages: updatedPermissions.sendTextMessages,
            changeGroupInfo: updatedPermissions.changeGroupInfo,
        });
    }

    public async getParticipantsRoute({
        user,
        conversationId,
        count,
        offset,
    }: ConversationsGetParticipantsRouteInput) {
        const participant = await this.prisma.participant.findFirst({
            where: {
                userId: user.id,
                status: ParticipantInStatus.IN,
                ban: null,
                conversation: {
                    id: conversationId,
                },
            },
            include: {
                conversation: {
                    include: {
                        groupConversation: true,
                        privateConversation: true,
                    },
                },
            },
        });

        if (!participant) {
            throw new RequestException({
                code: -1,
                message: 'Chat not found',
            });
        }

        const participants = await this.prisma.participant.findMany({
            where: {
                conversationId,
                status: ParticipantInStatus.IN,
            },
            skip: offset,
            take: count,
        });

        const users = await this.prisma.user.findMany({
            where: {
                id: {
                    in: participants.map((item) => item.userId),
                },
            },
        });

        return new ResponseDto({
            code: 1,
            response: participants.map((item) => {
                const _user = users.find((_item) => _item.id === item.userId);

                return new ParticipantDto({
                    id: item.id,
                    user: new UserDto({
                        id: _user.id,
                        username: _user.username,
                    }),
                });
            }),
        });
    }
}
