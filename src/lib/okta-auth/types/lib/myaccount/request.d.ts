import { default as BaseTransaction, TransactionType, TransactionLinks } from './transactions/Base';
import { MyAccountRequestOptions as RequestOptions } from './types';
import { AccessToken, OktaAuthOAuthInterface } from '../oidc/types';
declare type SendRequestOptions = RequestOptions & {
    url: string;
    method: string;
};
export declare function sendRequest<T extends BaseTransaction = BaseTransaction, N extends 'plural' | 'single' = 'single', NT = N extends 'plural' ? T[] : T>(oktaAuth: OktaAuthOAuthInterface, options: SendRequestOptions, TransactionClass?: TransactionType<T>): Promise<NT>;
export declare type GenerateRequestFnFromLinksOptions = {
    oktaAuth: OktaAuthOAuthInterface;
    accessToken: string | AccessToken;
    methodName: string;
    links: TransactionLinks;
};
declare type IRequestFnFromLinks<T extends BaseTransaction> = (payload?: any) => Promise<T>;
export declare function generateRequestFnFromLinks<T extends BaseTransaction>({ oktaAuth, accessToken, methodName, links, }: GenerateRequestFnFromLinksOptions, TransactionClass?: TransactionType<T>): IRequestFnFromLinks<T>;
export {};
