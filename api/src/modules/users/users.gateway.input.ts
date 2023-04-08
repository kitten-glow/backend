import { BaseGatewayRouteInput } from '../../common/types/gateway-route-input.interface';

export interface UsersGetByIdGatewayRouteInput extends BaseGatewayRouteInput {
    id: number;
}

export interface UsersGetByUsernameGatewayRouteInput
    extends BaseGatewayRouteInput {
    username: string;
}
