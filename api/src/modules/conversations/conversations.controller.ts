import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthUserHttp } from '../../common/decorators/auth/auth-user-http.decorator';
import { User } from '@prisma/client';
import { AuthHttpGuard } from '../../common/guards/auth/auth-http.guard';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ParseIntPipe } from '../../common/pipes/parse-int.pipe';
import { ParseBooleanPipe } from '../../common/pipes/parse-boolean.pipe';
import { DefaultValuePipe } from '../../common/pipes/default-value.pipe';
import { RequiredPipe } from '../../common/pipes/required.pipe';
import { ParseDatePipe } from '../../common/pipes/parse-date.pipe';
import { IsDateFuturePipe } from '../../common/pipes/is-date-future.pipe';
import { ConversationsGatewayService } from './conversations.gateway.service';
import { IsConversationGuard } from '../../common/guards/is-conversation.guard';
import { PermissionsInGroupConversationGuard } from '../../common/guards/permissions-in-group-conversation.guard';

@ApiTags('Conversations')
@UseGuards(AuthHttpGuard)
@Controller('conversations')
export class ConversationsController {
    constructor(private readonly conversationsGatewayService: ConversationsGatewayService) {}

    @ApiQuery({ name: 'count', required: false })
    @ApiQuery({ name: 'offset', required: false })
    @Get('getList')
    public getList(
        @AuthUserHttp() user: User,
        @Query('count', ParseIntPipe, new DefaultValuePipe(20)) count: number,
        @Query('offset', ParseIntPipe, new DefaultValuePipe(0)) offset: number,
    ) {
        return this.conversationsGatewayService.getListRoute({
            user,
            count,
            offset,
        });
    }

    @Get('createGroup')
    public createGroup(@AuthUserHttp() user: User, @Query('title') title: string) {
        return this.conversationsGatewayService.createGroupRoute({
            user,
            title,
        });
    }

    @ApiQuery({ name: 'conversationId' })
    @ApiQuery({ name: 'needAdminApprove', required: false })
    @ApiQuery({ name: 'memberLimit', required: false })
    @ApiQuery({ name: 'expireDate', required: false })
    @ApiQuery({ name: 'name', required: false })
    @Get('createInviteLink')
    public createInviteLink(
        @AuthUserHttp() user: User,
        @Query('conversationId', ParseIntPipe, RequiredPipe)
        conversationId: number,
        @Query('needAdminApprove', ParseBooleanPipe, new DefaultValuePipe(false))
        needAdminApprove: boolean,
        @Query('memberLimit', ParseIntPipe) memberLimit: number | undefined,
        @Query('expireDate', ParseDatePipe, IsDateFuturePipe)
        expireDate: Date | undefined,
        @Query('name') name: string | undefined,
    ) {
        return this.conversationsGatewayService.createInviteLinkRoute({
            user,
            conversationId,
            name,
            needAdminApprove,
            expireDate,
            memberLimit,
        });
    }

    @Get('previewInviteLink')
    public previewInviteLink(@Query('inviteLink', RequiredPipe) inviteLink: string) {
        return this.conversationsGatewayService.previewInviteLinkRoute({
            inviteLink,
        });
    }

    @Get('joinInviteLink')
    public joinInviteLink(@AuthUserHttp() user: User, @Query('inviteLink', RequiredPipe) inviteLink: string) {
        return this.conversationsGatewayService.joinInviteLinkRoute({
            user,
            inviteLink,
        });
    }

    @Get('setTitle')
    public setTitle(
        @AuthUserHttp() user: User,
        @Query('conversationId', ParseIntPipe, RequiredPipe)
        conversationId: number,
        @Query('title', RequiredPipe) title: string,
    ) {
        return this.conversationsGatewayService.setTitleRoute({
            user,
            conversationId,
            title,
        });
    }

    @Get('getMyPermissions')
    public getMyPermissions(
        @AuthUserHttp() user: User,
        @Query('conversationId', ParseIntPipe, RequiredPipe)
        conversationId: number,
    ) {
        return this.conversationsGatewayService.getMyPermissions({
            user,
            conversationId,
        });
    }

    @UseGuards(PermissionsInGroupConversationGuard({ editPermissions: true }))
    @UseGuards(IsConversationGuard('group'))
    @Get('permissions/update')
    public editPermissions(
        @AuthUserHttp() user: User,
        @Query('conversationId', ParseIntPipe, RequiredPipe)
        conversationId: number,
        @Query('sendTextMessages', ParseBooleanPipe) sendTextMessages: boolean | undefined,
        @Query('changeGroupInfo', ParseBooleanPipe) changeGroupInfo: boolean | undefined,
    ) {
        return this.conversationsGatewayService.updatePermissionsRoute({
            user,
            conversationId,
            sendTextMessages,
            changeGroupInfo,
        });
    }

    @UseGuards(IsConversationGuard('group'))
    @UseGuards(PermissionsInGroupConversationGuard({ editPermissions: true }))
    @Get('permissions/exception/update')
    public updatePermissionsException(
        @AuthUserHttp() user: User,
        @Query('userId', ParseIntPipe, RequiredPipe)
        userId: number,
        @Query('conversationId', ParseIntPipe, RequiredPipe)
        conversationId: number,
        @Query('sendTextMessages', ParseBooleanPipe) sendTextMessages: boolean | undefined,
        @Query('changeGroupInfo', ParseBooleanPipe) changeGroupInfo: boolean | undefined,
    ) {
        return this.conversationsGatewayService.updatePermissionsExceptionRoute({
            user,
            userId,
            conversationId,
            sendTextMessages,
            changeGroupInfo,
        });
    }

    @UseGuards(IsConversationGuard('group'))
    @UseGuards(PermissionsInGroupConversationGuard({ editPermissions: true }))
    @Get('permissions/exception/remove')
    public removePermissionsException(
        @AuthUserHttp() user: User,
        @Query('userId', ParseIntPipe, RequiredPipe)
        userId: number,
        @Query('conversationId', ParseIntPipe, RequiredPipe)
        conversationId: number,
    ) {
        return this.conversationsGatewayService.removePermissionsExceptionRoute({
            user,
            userId,
            conversationId,
        });
    }

    @Get('getParticipants')
    public getParticipants(
        @AuthUserHttp() user: User,
        @Query('conversationId', ParseIntPipe, RequiredPipe) conversationId: number,
        @Query('count', ParseIntPipe, new DefaultValuePipe(20)) count: number,
        @Query('offset', ParseIntPipe, new DefaultValuePipe(0)) offset: number,
    ) {
        return this.conversationsGatewayService.getParticipantsRoute({
            user,
            conversationId,
            count,
            offset,
        });
    }

    @Get('removeParticipant')
    public removeParticipant(
        @AuthUserHttp() user: User,
        @Query('conversationId', ParseIntPipe, RequiredPipe) conversationId: number,
        @Query('userId', ParseIntPipe, RequiredPipe) userId: number,
        @Query('reason') reason: string,
        @Query('notifyUser', ParseBooleanPipe, new DefaultValuePipe(false)) notifyUser: boolean,
    ) {
        return this.conversationsGatewayService.removeParticipantRoute({
            user,
            conversationId,
            userId,
            // todo сделать оповещение участников
            // reason,
            // notifyUser,
        });
    }
}
