import { User } from '@prisma/client';

export interface BaseGatewayRouteInput {}

export interface UserRequiredGatewayRouteInput extends BaseGatewayRouteInput {
    user: User;
}
