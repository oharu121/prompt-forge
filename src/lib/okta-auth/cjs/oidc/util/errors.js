"use strict";

exports.isAuthorizationCodeError = isAuthorizationCodeError;
exports.isInteractionRequiredError = isInteractionRequiredError;
exports.isRefreshTokenInvalidError = isRefreshTokenInvalidError;
var _errors = require("../../errors");
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

function isInteractionRequiredError(error) {
  if (error.name !== 'OAuthError') {
    return false;
  }
  const oauthError = error;
  return oauthError.errorCode === 'interaction_required';
}
function isAuthorizationCodeError(sdk, error) {
  if (error.name !== 'AuthApiError') {
    return false;
  }
  const authApiError = error;
  // xhr property doesn't seem to match XMLHttpRequest type
  const errorResponse = authApiError.xhr;
  const responseJSON = errorResponse?.responseJSON;
  return sdk.options.pkce && responseJSON?.error === 'invalid_grant';
}
function isRefreshTokenInvalidError(error) {
  // error: {"error":"invalid_grant","error_description":"The refresh token is invalid or expired."}
  return (0, _errors.isOAuthError)(error) && error.errorCode === 'invalid_grant' && error.errorSummary === 'The refresh token is invalid or expired.';
}
//# sourceMappingURL=errors.js.map