import { CanActivate, ExecutionContext, Injectable, mixin } from '@nestjs/common';
import { AuthRequest } from '../types/auth-request.interface';
import { ConversationsService } from '../../modules/conversations/conversations.service';
import { Prisma } from '@prisma/client';

export const PermissionsInGroupConversationGuard = (
    permissions: Prisma.GroupConversationPermissionsWhereInput &
        Prisma.GroupConversationParticipantAdminWhereInput,
) => {
    @Injectable()
    class PermissionsInGroupConversationGuardMixin implements CanActivate {
        constructor(public readonly conversationsService: ConversationsService) {}

        public async canActivate(context: ExecutionContext) {
            const request = context.switchToHttp().getRequest<AuthRequest>();

            const user = request.auth.user;
            const conversationId = +request.query.conversationId;

            if (isNaN(conversationId)) {
                return false;
            }

            return this.conversationsService.hasPermissionsInGroupConversation(
                conversationId,
                user.id,
                permissions,
            );
        }
    }

    return mixin(PermissionsInGroupConversationGuardMixin);
};
