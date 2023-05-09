import { Expose, Type } from 'class-transformer';
import { UserDto } from '../users/users.dto';

export class GroupConversationDto {
    constructor(partial: GroupConversationDto) {
        Object.assign(this, partial);
    }

    @Expose()
    public title: string;

    @Expose()
    public participants?: string[];
}

export class PrivateConversationDto {
    constructor(partial: PrivateConversationDto) {
        Object.assign(this, partial);
    }

    @Expose()
    public user: UserDto;

    // public participants: string[];
}

export class ConversationDto {
    constructor(partial: ConversationDto) {
        Object.assign(this, partial);
    }

    @Expose()
    public id: number;

    @Expose()
    public title: string;

    @Expose()
    public unreadCount: number;

    @Expose()
    @Type(() => GroupConversationDto)
    public groupConversation?: GroupConversationDto;

    @Expose()
    @Type(() => PrivateConversationDto)
    public privateConversation?: PrivateConversationDto;

    @Expose()
    public lastMessage: MessageDto;
}

export class InviteLinkDto {
    constructor(partial: InviteLinkDto) {
        Object.assign(this, partial);
    }

    @Expose()
    public conversationId: number;

    @Expose()
    public inviteLink: string;

    @Expose()
    public createdBy: number;

    @Expose()
    public name: string;

    @Expose()
    public createdAt: Date;

    @Expose()
    public memberLimit: number;

    @Expose()
    public needAdminApprove: boolean;

    @Expose()
    public expireDate: Date;
}

export class PreviewInviteLinkDto {
    constructor(partial: PreviewInviteLinkDto) {
        Object.assign(this, partial);
    }

    @Expose()
    public id: number;

    @Expose()
    public title: string;

    @Expose()
    public photo?: string;

    @Expose()
    public membersCount: number;
}

export class ParticipantDto {
    constructor(partial: ParticipantDto) {
        Object.assign(this, partial);
    }

    @Expose()
    public id: number;

    @Expose()
    @Type(() => UserDto)
    public user: UserDto;
}
