import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { ConversationsGatewayService } from './conversations.gateway.service';

@Module({
    providers: [ConversationsService, ConversationsGatewayService],
    controllers: [ConversationsController],
})
export class ConversationsModule {}
