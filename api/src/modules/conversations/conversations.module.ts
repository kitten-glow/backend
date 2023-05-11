import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { ConversationsGatewayService } from './conversations.gateway.service';
import { ConversationsCronService } from './conversations.cron.service';

@Module({
    providers: [ConversationsService, ConversationsCronService, ConversationsGatewayService],
    controllers: [ConversationsController],
})
export class ConversationsModule {}
