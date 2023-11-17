import {
    BaseGatewayRouteInput,
    UserRequiredGatewayRouteInput,
} from '../../common/types/gateway-route-input.interface';

export interface ConversationsGetListRouteInput extends UserRequiredGatewayRouteInput {
    count: number;
    offset: number;
}

export interface ConversationsCreateGroupRouteInput extends UserRequiredGatewayRouteInput {
    title: string;
}

export interface ConversationsCreateInviteLinkRouteInput extends UserRequiredGatewayRouteInput {
    conversationId: number;
    needAdminApprove: boolean;
    memberLimit: number | undefined;
    expireDate: Date | undefined;
    name: string | undefined;
}

export interface ConversationsPreviewInviteLinkRouteInput extends BaseGatewayRouteInput {
    inviteLink: string;
}

export interface ConversationsJoinInviteLinkRouteInput extends UserRequiredGatewayRouteInput {
    inviteLink: string;
}

export interface ConversationsSetTitleRouteInput extends UserRequiredGatewayRouteInput {
    conversationId: number;
    title: string;
}

export interface ConversationsUpdatePermissionsRouteInput extends UserRequiredGatewayRouteInput {
    conversationId: number;
    sendTextMessages: boolean | undefined;
    changeGroupInfo: boolean | undefined;
}

export interface ConversationsUpdatePermissionsExceptionRouteInput extends UserRequiredGatewayRouteInput {
    conversationId: number;
    userId: number;
    sendTextMessages: boolean | undefined;
    changeGroupInfo: boolean | undefined;
}

export interface ConversationsRemovePermissionsExceptionRouteInput extends UserRequiredGatewayRouteInput {
    conversationId: number;
    userId: number;
}

export interface ConversationsGetMyPermissionsRouteInput extends UserRequiredGatewayRouteInput {
    conversationId: number;
}

export interface ConversationsGetParticipantsRouteInput extends UserRequiredGatewayRouteInput {
    conversationId: number;
    count: number;
    offset: number;
}

export interface ConversationsRemoveParticipantRouteInput extends UserRequiredGatewayRouteInput {
    conversationId: number;
    userId: number;

    // с ними нужно обязательно что-то придумать
    // reason: string;
    // notifyUser: boolean;
}
