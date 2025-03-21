import { OktaAuthHttpInterface } from '../../http/types';
import { AccessToken } from '../../oidc/types';
export declare type TransactionLink = {
    href: string;
    hints?: {
        allow?: string[];
    };
};
export declare type TransactionLinks = {
    self: TransactionLink;
    [property: string]: TransactionLink;
};
declare type TransactionOptions = {
    res: {
        headers: Record<string, string>;
        _links?: Record<string, TransactionLink>;
        [property: string]: unknown;
    };
    accessToken: string | AccessToken;
};
export default class BaseTransaction {
    headers?: Record<string, string>;
    constructor(oktaAuth: OktaAuthHttpInterface, options: TransactionOptions);
}
export interface TransactionType<T extends BaseTransaction = BaseTransaction> extends Function {
    new (oktaAuth: OktaAuthHttpInterface, options: TransactionOptions): T;
    prototype: T;
}
export {};
