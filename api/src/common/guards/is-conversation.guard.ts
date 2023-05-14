import { CanActivate, ExecutionContext, Injectable, mixin } from '@nestjs/common';
import { AuthRequest } from '../types/auth-request.interface';
import { UniqueArray } from '../types/utils';
import { PrismaService } from '../../shared/prisma/prisma.service';

export const IsConversationGuard = (...types: UniqueArray<('private' | 'group')[]>) => {
    @Injectable()
    class IsConversationGuardMixin implements CanActivate {
        constructor(public readonly prisma: PrismaService) {}

        public async canActivate(context: ExecutionContext) {
            const request = context.switchToHttp().getRequest<AuthRequest>();

            const user = request.auth.user;
            const conversationId = +request.query.conversationId;

            if (isNaN(conversationId)) {
                return false;
            }

            const conversation = await this.prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    participants: {
                        some: {
                            userId: user.id,
                        },
                    },
                },
                include: {
                    privateConversation: true,
                    groupConversation: true,
                },
            });

            for (const type of types) {
                if (type === 'private' && !!conversation.privateConversation) {
                    return true;
                }

                if (type === 'group' && !!conversation.groupConversation) {
                    return true;
                }
            }

            return false;
        }
    }

    return mixin(IsConversationGuardMixin);
};
