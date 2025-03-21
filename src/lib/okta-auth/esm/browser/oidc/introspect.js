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

import AuthSdkError from '../errors/AuthSdkError.js';
import '../errors/WWWAuthError.js';
import { getWellKnown } from './endpoints/well-known.js';
import { btoa as b } from '../crypto/browser.js';
import { toQueryString } from '../util/url.js';
import { post } from '../http/request.js';
import 'tiny-emitter';
import 'js-cookie';
import 'cross-fetch';
import { TokenKind } from './types/Token.js';

const hintMap = {
    accessToken: 'access_token',
    idToken: 'id_token',
    refreshToken: 'refresh_token'
};
async function oidcIntrospect(sdk, kind, token) {
    var _a;
    let issuer;
    let clientId = sdk.options.clientId;
    let clientSecret = sdk.options.clientSecret;
    if (!token) {
        token = sdk.tokenManager.getTokens()[kind];
    }
    if (!token) {
        throw new AuthSdkError(`unable to find ${kind} in storage or fn params`);
    }
    if (kind !== TokenKind.ACCESS) {
        issuer = token === null || token === void 0 ? void 0 : token.issuer;
    }
    else {
        issuer = (_a = token === null || token === void 0 ? void 0 : token.claims) === null || _a === void 0 ? void 0 : _a.iss;
    }
    issuer = issuer || sdk.options.issuer;
    if (!clientId) {
        throw new AuthSdkError('A clientId must be specified in the OktaAuth constructor to introspect a token');
    }
    if (!issuer) {
        throw new AuthSdkError('Unable to find issuer');
    }
    
    // Check for custom introspect URL in options first
    let introspectUrl = sdk.options.introspectUrl;
    
    // If no custom URL provided, fall back to well-known endpoint
    if (!introspectUrl) {
        const { introspection_endpoint } = await getWellKnown(sdk, issuer);
        introspectUrl = introspection_endpoint;
    }
    
    const authHeader = clientSecret ? b(`${clientId}:${clientSecret}`) : b(clientId);
    const args = toQueryString({
        token_type_hint: hintMap[kind],
        token: token[kind]
    }).slice(1);
    return post(sdk, introspectUrl, args, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + authHeader
        }
    });
}

export { oidcIntrospect };
//# sourceMappingURL=introspect.js.map
