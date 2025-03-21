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
import { getWithoutPrompt } from './getWithoutPrompt.js';
import { renewTokensWithRefresh } from './renewTokensWithRefresh.js';
import { getDefaultTokenParams } from './util/defaultTokenParams.js';
import '../http/request.js';
import 'tiny-emitter';
import 'js-cookie';
import 'cross-fetch';
import './types/Token.js';

async function renewTokens(sdk, options) {
    var _a;
    const tokens = (_a = options === null || options === void 0 ? void 0 : options.tokens) !== null && _a !== void 0 ? _a : sdk.tokenManager.getTokensSync();
    if (tokens.refreshToken) {
        return renewTokensWithRefresh(sdk, options || {}, tokens.refreshToken);
    }
    if (!tokens.accessToken && !tokens.idToken) {
        throw new AuthSdkError('renewTokens() was called but there is no existing token');
    }
    const accessToken = tokens.accessToken || {};
    const idToken = tokens.idToken || {};
    const scopes = accessToken.scopes || idToken.scopes;
    if (!scopes) {
        throw new AuthSdkError('renewTokens: invalid tokens: could not read scopes');
    }
    const authorizeUrl = accessToken.authorizeUrl || idToken.authorizeUrl;
    if (!authorizeUrl) {
        throw new AuthSdkError('renewTokens: invalid tokens: could not read authorizeUrl');
    }
    const userinfoUrl = accessToken.userinfoUrl || sdk.options.userinfoUrl;
    const issuer = idToken.issuer || sdk.options.issuer;
    const dpopPairId = accessToken === null || accessToken === void 0 ? void 0 : accessToken.dpopPairId;
    const extraParams = (accessToken === null || accessToken === void 0 ? void 0 : accessToken.extraParams) || (idToken === null || idToken === void 0 ? void 0 : idToken.extraParams);
    options = Object.assign({
        scopes,
        authorizeUrl,
        userinfoUrl,
        issuer,
        dpopPairId,
        extraParams
    }, options);
    if (sdk.options.pkce) {
        options.responseType = 'code';
    }
    else {
        const { responseType } = getDefaultTokenParams(sdk);
        options.responseType = responseType;
    }
    return getWithoutPrompt(sdk, options)
        .then(res => res.tokens);
}

export { renewTokens };
//# sourceMappingURL=renewTokens.js.map
