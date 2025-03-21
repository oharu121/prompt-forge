"use strict";

exports.oidcIntrospect = oidcIntrospect;
var _errors = require("../errors");
var _wellKnown = require("./endpoints/well-known");
var _http = require("../http");
var _util = require("../util");
var _crypto = require("../crypto");
var _types = require("./types");
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

const hintMap = {
  accessToken: 'access_token',
  idToken: 'id_token',
  refreshToken: 'refresh_token'
};

/* eslint complexity: [2, 9] */
async function oidcIntrospect(sdk, kind, token) {
  let issuer;
  let clientId = sdk.options.clientId;
  let clientSecret = sdk.options.clientSecret;
  if (!token) {
    token = sdk.tokenManager.getTokens()[kind];
  }
  if (!token) {
    throw new _errors.AuthSdkError(`unable to find ${kind} in storage or fn params`);
  }
  if (kind !== _types.TokenKind.ACCESS) {
    issuer = token?.issuer;
  } else {
    issuer = token?.claims?.iss;
  }
  issuer = issuer || sdk.options.issuer;
  if (!clientId) {
    throw new _errors.AuthSdkError('A clientId must be specified in the OktaAuth constructor to introspect a token');
  }
  if (!issuer) {
    throw new _errors.AuthSdkError('Unable to find issuer');
  }
  
  // Check for custom introspect URL in options first
  let introspectUrl = sdk.options.introspectUrl;
  
  // If no custom URL provided, fall back to well-known endpoint
  if (!introspectUrl) {
    const {
      introspection_endpoint
    } = await (0, _wellKnown.getWellKnown)(sdk, issuer);
    introspectUrl = introspection_endpoint;
  }
  
  const authHeader = clientSecret ? (0, _crypto.btoa)(`${clientId}:${clientSecret}`) : (0, _crypto.btoa)(clientId);
  const args = (0, _util.toQueryString)({
    // eslint-disable-next-line camelcase
    token_type_hint: hintMap[kind],
    token: token[kind] // extract raw token string from token object
  }).slice(1);
  return (0, _http.post)(sdk, introspectUrl, args, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + authHeader
    }
  });
}
//# sourceMappingURL=introspect.js.map