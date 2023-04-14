import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AuthHttpGuard } from '../../common/guards/auth/auth-http.guard';
import { AuthUserHttp } from '../../common/decorators/auth/auth-user-http.decorator';
import { User } from '@prisma/client';
import { ParseIntPipe } from '../../common/pipes/parse-int.pipe';
import { ParseBooleanPipe } from '../../common/pipes/parse-boolean.pipe';
import { DefaultValuePipe } from '../../common/pipes/default-value.pipe';
import { ApiTags } from '@nestjs/swagger';
import { MessagesGatewayService } from './messages.gateway.service';
import { RequiredPipe } from '../../common/pipes/required.pipe';

@ApiTags('Messages')
@UseGuards(AuthHttpGuard)
@Controller('messages')
export class MessagesController {
    constructor(
        private readonly prisma: PrismaService,
        private readonly messagesGatewayService: MessagesGatewayService,
    ) {}

    @Get('send')
    public send(
        @AuthUserHttp() user: User,
        @Query('conversationId', ParseIntPipe)
        conversationId: number | undefined,
        @Query('userId', ParseIntPipe) userId: number | undefined,
        @Query('content', RequiredPipe) content: string,
        @Query('silent', ParseBooleanPipe, new DefaultValuePipe(false))
        silent: boolean,
    ) {
        return this.messagesGatewayService.sendRoute({
            user,
            conversationId,
            userId,
            content,
            silent,
        });
    }

    @Get('getList')
    public getList(
        @AuthUserHttp() user: User,
        @Query('conversationId', ParseIntPipe) conversationId: number,
        @Query('userId', ParseIntPipe) userId: number,
        @Query('offset', ParseIntPipe, new DefaultValuePipe(0)) offset: number,
        @Query('count', ParseIntPipe, new DefaultValuePipe(20)) count: number,
        @Query('startMessageId', ParseIntPipe) startMessageId: number | undefined,
        @Query('reversed', ParseBooleanPipe, new DefaultValuePipe(false))
        reversed: boolean,
    ) {
        return this.messagesGatewayService.getListRoute({
            user,
            conversationId,
            userId,
            offset,
            count,
            startMessageId,
            reversed,
        });
    }

    @Get('markAsRead')
    public markAsRead(@AuthUserHttp() user: User, @Query('messageId', ParseIntPipe) messageId: number) {
        return this.messagesGatewayService.markAsReadRoute({ user, messageId });
    }

    @Get('pin')
    public pin(@AuthUserHttp() user: User, @Query('messageId', ParseIntPipe) messageId: number) {
        return this.messagesGatewayService.pinRoute({ user, messageId });
    }

    @Get('getPinned')
    public getPinned(
        @AuthUserHttp() user: User,
        @Query('conversationId', ParseIntPipe) conversationId: number,
    ) {
        return this.messagesGatewayService.getPinnedRoute({
            user,
            conversationId,
        });
    }

    @Get('delete')
    public delete(@AuthUserHttp() user: User, @Query('messageId', ParseIntPipe) messageId: number) {
        return this.messagesGatewayService.deleteRoute({ user, messageId });
    }
}
