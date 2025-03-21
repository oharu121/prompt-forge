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
import { isIDToken, isAccessToken } from './types/Token.js';
import { getWithoutPrompt } from './getWithoutPrompt.js';
import { renewTokensWithRefresh } from './renewTokensWithRefresh.js';

function throwInvalidTokenError() {
    throw new AuthSdkError('Renew must be passed a token with an array of scopes and an accessToken or idToken');
}
function getSingleToken(originalToken, tokens) {
    if (isIDToken(originalToken)) {
        return tokens.idToken;
    }
    if (isAccessToken(originalToken)) {
        return tokens.accessToken;
    }
    throwInvalidTokenError();
}
async function renewToken(sdk, token) {
    if (!isIDToken(token) && !isAccessToken(token)) {
        throwInvalidTokenError();
    }
    let tokens = sdk.tokenManager.getTokensSync();
    if (tokens.refreshToken) {
        tokens = await renewTokensWithRefresh(sdk, {
            scopes: token.scopes,
        }, tokens.refreshToken);
        return getSingleToken(token, tokens);
    }
    var responseType;
    if (sdk.options.pkce) {
        responseType = 'code';
    }
    else if (isAccessToken(token)) {
        responseType = 'token';
    }
    else {
        responseType = 'id_token';
    }
    const { scopes, authorizeUrl, userinfoUrl, issuer, dpopPairId, extraParams } = token;
    return getWithoutPrompt(sdk, {
        responseType,
        scopes,
        authorizeUrl,
        userinfoUrl,
        issuer,
        dpopPairId,
        extraParams
    })
        .then(function (res) {
        return getSingleToken(token, res.tokens);
    });
}

export { renewToken };
//# sourceMappingURL=renewToken.js.map
