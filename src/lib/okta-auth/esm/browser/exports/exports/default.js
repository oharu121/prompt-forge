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

export { authenticate } from '../../idx/authenticate.js';
export { cancel } from '../../idx/cancel.js';
export { handleEmailVerifyCallback, isEmailVerifyCallback, isEmailVerifyCallbackError, parseEmailVerifyCallback } from '../../idx/emailVerify.js';
export { interact } from '../../idx/interact.js';
export { introspect } from '../../idx/introspect.js';
export { poll } from '../../idx/poll.js';
export { canProceed, proceed } from '../../idx/proceed.js';
export { register } from '../../idx/register.js';
export { recoverPassword } from '../../idx/recoverPassword.js';
export { handleInteractionCodeRedirect } from '../../idx/handleInteractionCodeRedirect.js';
export { startTransaction } from '../../idx/startTransaction.js';
export { unlockAccount } from '../../idx/unlockAccount.js';
export { clearTransactionMeta, createTransactionMeta, getSavedTransactionMeta, getTransactionMeta, hasSavedInteractionHandle, isTransactionMetaValid, isTransactionMetaValidForFlow, isTransactionMetaValidForOptions, saveTransactionMeta } from '../../idx/transactionMeta.js';
export { createIdxAPI } from '../../idx/factory/api.js';
import { createOktaAuthIdx } from '../../idx/factory/OktaAuthIdx.js';
export { createOktaAuthIdx } from '../../idx/factory/OktaAuthIdx.js';
export { createMinimalOktaAuthIdx } from '../../idx/factory/MinimalOktaAuthIdx.js';
export { mixinIdx } from '../../idx/mixin.js';
import { createIdxOptionsConstructor } from '../../idx/options.js';
export { createIdxOptionsConstructor } from '../../idx/options.js';
import { createIdxStorageManager } from '../../idx/storage.js';
export { createIdxStorageManager } from '../../idx/storage.js';
export { AuthenticatorKey, IdxFeature, IdxStatus, isAuthenticator } from '../../idx/types/api.js';
import { createIdxTransactionManager } from '../../idx/IdxTransactionManager.js';
export { createIdxTransactionManager } from '../../idx/IdxTransactionManager.js';
export { getProfile, getProfileSchema, updateProfile } from '../../myaccount/profileApi.js';
export { addEmail, deleteEmail, getEmail, getEmailChallenge, getEmails, sendEmailChallenge, verifyEmailChallenge } from '../../myaccount/emailApi.js';
export { addPhone, deletePhone, getPhone, getPhones, sendPhoneChallenge, verifyPhoneChallenge } from '../../myaccount/phoneApi.js';
export { deletePassword, enrollPassword, getPassword, updatePassword } from '../../myaccount/passwordApi.js';
export { createOktaAuthMyAccount } from '../../myaccount/factory.js';
import { mixinMyAccount } from '../../myaccount/mixin.js';
export { mixinMyAccount } from '../../myaccount/mixin.js';
export { EmailRole, PasswordStatus, Status } from '../../myaccount/types.js';
export { createAuthnTransactionAPI } from '../../authn/factory.js';
import { mixinAuthn } from '../../authn/mixin.js';
export { mixinAuthn } from '../../authn/mixin.js';
import * as index from '../../crypto/index.js';
export { index as crypto };
export { createOktaAuthBase } from '../../base/factory.js';
export { createBaseOptionsConstructor } from '../../base/options.js';
export { ACCESS_TOKEN_STORAGE_KEY, CACHE_STORAGE_NAME, DEFAULT_CACHE_DURATION, DEFAULT_CODE_CHALLENGE_METHOD, DEFAULT_MAX_CLOCK_SKEW, DEFAULT_POLLING_DELAY, IDX_API_VERSION, IDX_RESPONSE_STORAGE_NAME, ID_TOKEN_STORAGE_KEY, IOS_MAX_RETRY_COUNT, MAX_VERIFIER_LENGTH, MIN_VERIFIER_LENGTH, ORIGINAL_URI_STORAGE_NAME, PKCE_STORAGE_NAME, REFERRER_PATH_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY, SHARED_TRANSACTION_STORAGE_NAME, STATE_TOKEN_KEY_NAME, TOKEN_STORAGE_NAME, TRANSACTION_STORAGE_NAME } from '../../constants.js';
export { AuthStateManager, INITIAL_AUTH_STATE } from '../../core/AuthStateManager.js';
export { createCoreOptionsConstructor } from '../../core/options.js';
export { createOktaAuthCore } from '../../core/factory.js';
export { mixinCore } from '../../core/mixin.js';
export { createCoreStorageManager } from '../../core/storage.js';
export { ServiceManager } from '../../core/ServiceManager/browser.js';
export { isAuthApiError, isOAuthError, isWWWAuthError } from '../../errors/index.js';
export { setRequestHeader } from '../../http/headers.js';
export { OktaUserAgent } from '../../http/OktaUserAgent.js';
export { get, httpRequest, post } from '../../http/request.js';
export { mixinHttp } from '../../http/mixin.js';
export { createHttpOptionsConstructor } from '../../http/options.js';
export { createEndpoints, createTokenAPI } from '../../oidc/factory/api.js';
export { createOktaAuthOAuth } from '../../oidc/factory/OktaAuthOAuth.js';
export { mixinOAuth } from '../../oidc/mixin/index.js';
export { createOAuthStorageManager } from '../../oidc/storage.js';
export { buildAuthorizeParams, convertTokenParamsToOAuthParams } from '../../oidc/endpoints/authorize.js';
export { postRefreshToken, postToTokenEndpoint } from '../../oidc/endpoints/token.js';
export { getKey, getWellKnown } from '../../oidc/endpoints/well-known.js';
export { createOAuthOptionsConstructor } from '../../oidc/options/OAuthOptionsConstructor.js';
export { TokenKind, isAccessToken, isIDToken, isRefreshToken, isToken } from '../../oidc/types/Token.js';
export { EVENT_ADDED, EVENT_ERROR, EVENT_EXPIRED, EVENT_REMOVED, EVENT_RENEWED, EVENT_SET_STORAGE } from '../../oidc/types/TokenManager.js';
export { isCustomAuthTransactionMeta, isIdxTransactionMeta, isOAuthTransactionMeta, isPKCETransactionMeta, isTransactionMeta } from '../../oidc/types/Transaction.js';
export { TokenManager } from '../../oidc/TokenManager.js';
export { createTransactionManager } from '../../oidc/TransactionManager.js';
export { addListener, addPostMessageListener, loadFrame, loadPopup, removeListener } from '../../oidc/util/browser.js';
export { getDefaultTokenParams } from '../../oidc/util/defaultTokenParams.js';
export { getDefaultEnrollAuthenticatorParams } from '../../oidc/util/defaultEnrollAuthenticatorParams.js';
export { isAuthorizationCodeError, isInteractionRequiredError, isRefreshTokenInvalidError } from '../../oidc/util/errors.js';
export { getHashOrSearch, hasAuthorizationCode, hasErrorInUrl, hasInteractionCode, hasResponseType, hasTokensInHash, isCodeFlow, isInteractionRequired, isLoginRedirect, isRedirectUri } from '../../oidc/util/loginRedirect.js';
export { generateNonce, generateState, getOAuthBaseUrl, getOAuthDomain, getOAuthUrls } from '../../oidc/util/oauth.js';
export { createOAuthMeta } from '../../oidc/util/oauthMeta.js';
export { createEnrollAuthenticatorMeta } from '../../oidc/util/enrollAuthenticatorMeta.js';
export { default as pkce } from '../../oidc/util/pkce.js';
export { assertPKCESupport, preparePKCE, prepareTokenParams, validateCodeChallengeMethod } from '../../oidc/util/prepareTokenParams.js';
export { prepareEnrollAuthenticatorParams } from '../../oidc/util/prepareEnrollAuthenticatorParams.js';
export { isRefreshTokenError, isSameRefreshToken } from '../../oidc/util/refreshToken.js';
export { urlParamsToObject } from '../../oidc/util/urlParams.js';
export { validateClaims } from '../../oidc/util/validateClaims.js';
export { validateToken } from '../../oidc/util/validateToken.js';
export { decodeToken } from '../../oidc/decodeToken.js';
export { revokeToken } from '../../oidc/revokeToken.js';
export { renewToken } from '../../oidc/renewToken.js';
export { renewTokensWithRefresh } from '../../oidc/renewTokensWithRefresh.js';
export { renewTokens } from '../../oidc/renewTokens.js';
export { verifyToken } from '../../oidc/verifyToken.js';
export { getUserInfo } from '../../oidc/getUserInfo.js';
export { handleOAuthResponse } from '../../oidc/handleOAuthResponse.js';
export { exchangeCodeForTokens } from '../../oidc/exchangeCodeForTokens.js';
export { getToken } from '../../oidc/getToken.js';
export { getWithoutPrompt } from '../../oidc/getWithoutPrompt.js';
export { getWithPopup } from '../../oidc/getWithPopup.js';
export { getWithRedirect } from '../../oidc/getWithRedirect.js';
export { parseFromUrl } from '../../oidc/parseFromUrl.js';
export { oidcIntrospect } from '../../oidc/introspect.js';
export { closeSession, getSession, refreshSession, sessionExists, setCookieAndRedirect } from '../../session/api.js';
export { createSessionApi } from '../../session/factory.js';
export { mixinSession } from '../../session/mixin.js';
export { createStorageOptionsConstructor } from '../../storage/options/StorageOptionsConstructor.js';
export { BaseStorageManager, logServerSideMemoryStorageWarning } from '../../storage/BaseStorageManager.js';
export { mixinStorage } from '../../storage/mixin.js';
export { SavedObject } from '../../storage/SavedObject.js';
export { deprecate, deprecateWrap, getConsole, getNativeConsole, warn } from '../../util/console.js';
export { delay, genRandomString, isoToUTCString, split2 } from '../../util/misc.js';
export { bind, clone, extend, find, getLink, omit, removeNils } from '../../util/object.js';
export { PromiseQueue } from '../../util/PromiseQueue.js';
export { isFunction, isNumber, isObject, isPromise, isString } from '../../util/types.js';
export { isAbsoluteUrl, removeTrailingSlash, toAbsoluteUrl, toQueryString, toRelativeUrl } from '../../util/url.js';
export { default as AuthApiError } from '../../errors/AuthApiError.js';
export { default as AuthPollStopError } from '../../errors/AuthPollStopError.js';
export { default as AuthSdkError } from '../../errors/AuthSdkError.js';
export { default as OAuthError } from '../../errors/OAuthError.js';
export { default as WWWAuthError } from '../../errors/WWWAuthError.js';

const OptionsConstructor = createIdxOptionsConstructor();
const StorageManager = createIdxStorageManager();
const TransactionManager = createIdxTransactionManager();
const WithIdx = createOktaAuthIdx(StorageManager, OptionsConstructor, TransactionManager);
const WithMyAccount = mixinMyAccount(WithIdx);
const WithAuthn = mixinAuthn(WithMyAccount);
class OktaAuth extends WithAuthn {
    constructor(options) {
        super(options);
    }
}

export { OktaAuth, OktaAuth as default };
//# sourceMappingURL=default.js.map
