import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessagesGatewayService } from './messages.gateway.service';

@Module({
    controllers: [MessagesController],
    providers: [MessagesService, MessagesGatewayService],
})
export class MessagesModule {}
