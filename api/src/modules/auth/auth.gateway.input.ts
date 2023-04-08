import { BaseGatewayRouteInput } from '../../common/types/gateway-route-input.interface';

export interface AuthLoginGatewayRouteInput extends BaseGatewayRouteInput {
    username: string;
    password: string;
}
