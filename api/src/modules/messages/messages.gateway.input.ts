import { UserRequiredGatewayRouteInput } from '../../common/types/gateway-route-input.interface';

export interface MessagesSendRouteInput extends UserRequiredGatewayRouteInput {
    conversationId: number | undefined;
    userId: number | undefined;
    content: string | undefined;
    silent: boolean;
}

export interface MessagesGetListRouteInput
    extends UserRequiredGatewayRouteInput {
    conversationId: number | undefined;
    userId: number | undefined;
    offset: number;
    count: number;
    startMessageId: number;
    reversed: boolean;
}

export interface MessagesMarkAsReadRouteInput
    extends UserRequiredGatewayRouteInput {
    messageId: number;
}

export interface MessagesPinRouteInput extends UserRequiredGatewayRouteInput {
    messageId: number;
}

export interface MessagesGetPinnedRouteInput
    extends UserRequiredGatewayRouteInput {
    conversationId: number;
}

export interface MessagesDeleteRouteInput
    extends UserRequiredGatewayRouteInput {
    messageId: number;
}
