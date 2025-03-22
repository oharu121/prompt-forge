import { IDToken, OktaAuthOAuthInterface, TokenVerifyParams } from './types';
export declare function verifyToken(sdk: OktaAuthOAuthInterface, token: IDToken, validationParams: TokenVerifyParams): Promise<IDToken>;
