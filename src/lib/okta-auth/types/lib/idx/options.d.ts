/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
import { FlowIdentifier } from './types/FlowIdentifier';
export declare function createIdxOptionsConstructor(): {
    new (options: any): {
        flow: FlowIdentifier;
        activationToken: string;
        recoveryToken: string;
        idx: {
            useGenericRemediator?: boolean;
            exchangeCodeForTokens?: boolean;
        };
        services: import("../core").ServiceManagerOptions;
        transformAuthState: (oktaAuth: import("../core").OktaAuthCoreInterface<import("../oidc").PKCETransactionMeta, import("../core").CoreStorageManagerInterface<import("../oidc").PKCETransactionMeta>, import("../core").OktaAuthCoreOptions, import("../oidc").TransactionManagerInterface>, authState: import("../core").AuthState) => Promise<import("../core").AuthState>;
        issuer: string;
        authorizeUrl: string;
        userinfoUrl: string;
        tokenUrl: string;
        revokeUrl: string;
        logoutUrl: string;
        pkce: boolean;
        clientId: string;
        redirectUri: string;
        responseType: import("../oidc").OAuthResponseType | import("../oidc").OAuthResponseType[];
        responseMode: import("../oidc").OAuthResponseMode;
        state: string;
        scopes: string[];
        ignoreSignature: boolean;
        codeChallenge: string;
        codeChallengeMethod: string;
        acrValues: string;
        maxAge: string | number;
        dpop: boolean;
        tokenManager: import("../oidc").TokenManagerOptions;
        postLogoutRedirectUri: string;
        restoreOriginalUri: (oktaAuth: import("../oidc").OktaAuthOAuthInterface<import("../oidc").PKCETransactionMeta, import("../oidc").OAuthStorageManagerInterface<import("../oidc").PKCETransactionMeta>, import("../oidc").OktaAuthOAuthOptions, import("../oidc").TransactionManagerInterface>, originalUri?: string | undefined) => Promise<void>;
        transactionManager: import("../oidc").TransactionManagerOptions;
        clientSecret: string;
        setLocation: import("../oidc").SetLocationFunction;
        ignoreLifetime: boolean;
        maxClockSkew: number;
        transformErrorXHR: (xhr: object) => any;
        headers: object;
        httpRequestClient: import("../http").HttpRequestClient;
        httpRequestInterceptors: ((request: import("../http").RequestOptions) => void)[];
        pollDelay: number;
        cookies: import("../storage").CookieOptions;
        storageUtil: import("../storage").StorageUtil;
        storageManager: import("../storage").StorageManagerOptions;
        devMode: boolean;
    };
};
