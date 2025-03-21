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

import '../errors/WWWAuthError.js';
import { getDefaultTokenParams } from './util/defaultTokenParams.js';
import { getOAuthUrls } from './util/oauth.js';
import '../crypto/node.js';
import { clone } from '../util/object.js';
import '../http/request.js';
import 'tiny-emitter';
import '../server/serverStorage.js';
import 'cross-fetch';
import './types/Token.js';
import { postToTokenEndpoint } from './endpoints/token.js';
import { handleOAuthResponse } from './handleOAuthResponse.js';
import { findKeyPair, createDPoPKeyPair } from './dpop.js';

async function exchangeCodeForTokens(sdk, tokenParams, urls) {
    urls = urls || getOAuthUrls(sdk, tokenParams);
    tokenParams = Object.assign({}, getDefaultTokenParams(sdk), clone(tokenParams));
    const { authorizationCode, interactionCode, codeVerifier, clientId, redirectUri, scopes, ignoreSignature, state, acrValues, dpop, dpopPairId, extraParams } = tokenParams;
    const getTokenOptions = {
        clientId,
        redirectUri,
        authorizationCode,
        interactionCode,
        codeVerifier,
        dpop,
    };
    const responseType = ['token'];
    if (scopes.indexOf('openid') !== -1) {
        responseType.push('id_token');
    }
    const handleResponseOptions = {
        clientId,
        redirectUri,
        scopes,
        responseType,
        ignoreSignature,
        acrValues,
        extraParams
    };
    try {
        if (dpop) {
            if (dpopPairId) {
                const keyPair = await findKeyPair(dpopPairId);
                getTokenOptions.dpopKeyPair = keyPair;
                handleResponseOptions.dpop = dpop;
                handleResponseOptions.dpopPairId = dpopPairId;
            }
            else {
                const { keyPair, keyPairId } = await createDPoPKeyPair();
                getTokenOptions.dpopKeyPair = keyPair;
                handleResponseOptions.dpop = dpop;
                handleResponseOptions.dpopPairId = keyPairId;
            }
        }
        const oauthResponse = await postToTokenEndpoint(sdk, getTokenOptions, urls);
        const tokenResponse = await handleOAuthResponse(sdk, handleResponseOptions, oauthResponse, urls);
        tokenResponse.code = authorizationCode;
        tokenResponse.state = state;
        return tokenResponse;
    }
    finally {
        sdk.transactionManager.clear();
    }
}

export { exchangeCodeForTokens };
//# sourceMappingURL=exchangeCodeForTokens.js.map
