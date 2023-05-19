import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { ParticipantInStatus, Prisma } from '@prisma/client';

@Injectable()
export class ConversationsService {
    constructor(private readonly prisma: PrismaService) {}

    private generateRandomString(
        length: number,
        charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    ) {
        let randomString = '';
        for (let i = 0; i < length; i++) {
            const randomPoz = Math.floor(Math.random() * charSet.length);
            randomString += charSet.substring(randomPoz, randomPoz + 1);
        }

        return randomString;
    }

    public generateInviteLink() {
        return this.generateRandomString(13);
    }

    public async hasPermissionsInGroupConversation(
        conversationId: number,
        userId: number,
        permissions: Prisma.GroupConversationPermissionsWhereInput & Prisma.GroupConversationParticipantAdminWhereInput,
    ) {
        const participant = await this.prisma.participant.findFirst({
            where: {
                userId,
                status: ParticipantInStatus.IN,
                ban: null,
                conversationId,
                groupConversationParticipant: {
                    OR: [
                        // сначала проверяем, вдруг админ наш пользователь
                        {
                            admin: {
                                OR: [
                                    {
                                        isOwner: true,
                                    },
                                    {
                                        changeGroupInfo: permissions.changeGroupInfo,
                                        editPermissions: permissions.editPermissions,
                                        pinMessages: permissions.pinMessages,
                                        manageLinks: permissions.manageLinks,
                                        addNewAdmins: permissions.addNewAdmins,
                                    },
                                ],
                            },
                        },
                        // если нет, идем уже по другим правам
                        {
                            groupConversation: {
                                permissions: {
                                    OR: [
                                        // если вдруг наш пользователь есть в
                                        // исключениях, смотрим это
                                        {
                                            exceptions: {
                                                some: {
                                                    userId,
                                                    sendTextMessages: permissions.sendTextMessages,
                                                    changeGroupInfo: permissions.changeGroupInfo,
                                                },
                                            },
                                        },
                                        // если в исключениях его нет, смотрим
                                        // основные права в группе
                                        {
                                            exceptions: {
                                                none: {
                                                    userId,
                                                },
                                            },
                                            sendTextMessages: permissions.sendTextMessages,
                                            changeGroupInfo: permissions.changeGroupInfo,
                                        },
                                    ],
                                },
                            }
                        },
                    ],
                },
            },
        });

        return !!participant;
    }
}
