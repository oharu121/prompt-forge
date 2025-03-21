"use strict";

exports.renewTokens = renewTokens;
var _errors = require("../errors");
var _getWithoutPrompt = require("./getWithoutPrompt");
var _renewTokensWithRefresh = require("./renewTokensWithRefresh");
var _util = require("./util");
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
 *
 */

// If we have a refresh token, renew using that, otherwise getWithoutPrompt
// eslint-disable-next-line complexity
async function renewTokens(sdk, options) {
  const tokens = options?.tokens ?? sdk.tokenManager.getTokensSync();
  if (tokens.refreshToken) {
    return (0, _renewTokensWithRefresh.renewTokensWithRefresh)(sdk, options || {}, tokens.refreshToken);
  }
  if (!tokens.accessToken && !tokens.idToken) {
    throw new _errors.AuthSdkError('renewTokens() was called but there is no existing token');
  }
  const accessToken = tokens.accessToken || {};
  const idToken = tokens.idToken || {};
  const scopes = accessToken.scopes || idToken.scopes;
  if (!scopes) {
    throw new _errors.AuthSdkError('renewTokens: invalid tokens: could not read scopes');
  }
  const authorizeUrl = accessToken.authorizeUrl || idToken.authorizeUrl;
  if (!authorizeUrl) {
    throw new _errors.AuthSdkError('renewTokens: invalid tokens: could not read authorizeUrl');
  }
  const userinfoUrl = accessToken.userinfoUrl || sdk.options.userinfoUrl;
  const issuer = idToken.issuer || sdk.options.issuer;
  const dpopPairId = accessToken?.dpopPairId;
  const extraParams = accessToken?.extraParams || idToken?.extraParams;

  // Get tokens using the SSO cookie
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
  } else {
    const {
      responseType
    } = (0, _util.getDefaultTokenParams)(sdk);
    options.responseType = responseType;
  }
  return (0, _getWithoutPrompt.getWithoutPrompt)(sdk, options).then(res => res.tokens);
}
//# sourceMappingURL=renewTokens.js.map