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

import PCancelable from 'p-cancelable';
import AuthSdkError from '../errors/AuthSdkError.js';
import '../errors/WWWAuthError.js';
import { getConsole } from '../util/console.js';
import { PromiseQueue } from '../util/PromiseQueue.js';
import '../crypto/node.js';
import '../http/request.js';
import 'tiny-emitter';
import '../server/serverStorage.js';
import 'cross-fetch';
import '../oidc/types/Token.js';
import { EVENT_ADDED, EVENT_REMOVED } from '../oidc/types/TokenManager.js';
import '../_virtual/_tslib.js';

const INITIAL_AUTH_STATE = null;
const DEFAULT_PENDING = {
    updateAuthStatePromise: null,
    canceledTimes: 0
};
const EVENT_AUTH_STATE_CHANGE = 'authStateChange';
const MAX_PROMISE_CANCEL_TIMES = 10;
const isSameAuthState = (prevState, state) => {
    if (!prevState) {
        return false;
    }
    return prevState.isAuthenticated === state.isAuthenticated
        && JSON.stringify(prevState.idToken) === JSON.stringify(state.idToken)
        && JSON.stringify(prevState.accessToken) === JSON.stringify(state.accessToken)
        && prevState.error === state.error;
};
class AuthStateManager {
    constructor(sdk) {
        if (!sdk.emitter) {
            throw new AuthSdkError('Emitter should be initialized before AuthStateManager');
        }
        this._sdk = sdk;
        this._pending = Object.assign({}, DEFAULT_PENDING);
        this._authState = INITIAL_AUTH_STATE;
        this._logOptions = {};
        this._prevAuthState = null;
        this._transformQueue = new PromiseQueue({
            quiet: true
        });
        sdk.tokenManager.on(EVENT_ADDED, (key, token) => {
            this._setLogOptions({ event: EVENT_ADDED, key, token });
            this.updateAuthState();
        });
        sdk.tokenManager.on(EVENT_REMOVED, (key, token) => {
            this._setLogOptions({ event: EVENT_REMOVED, key, token });
            this.updateAuthState();
        });
    }
    _setLogOptions(options) {
        this._logOptions = options;
    }
    getAuthState() {
        return this._authState;
    }
    getPreviousAuthState() {
        return this._prevAuthState;
    }
    async updateAuthState() {
        const { transformAuthState, devMode } = this._sdk.options;
        const log = (status) => {
            const { event, key, token } = this._logOptions;
            getConsole().group(`OKTA-AUTH-JS:updateAuthState: Event:${event} Status:${status}`);
            getConsole().log(key, token);
            getConsole().log('Current authState', this._authState);
            getConsole().groupEnd();
            this._logOptions = {};
        };
        const emitAuthStateChange = (authState) => {
            if (isSameAuthState(this._authState, authState)) {
                devMode && log('unchanged');
                return;
            }
            this._prevAuthState = this._authState;
            this._authState = authState;
            this._sdk.emitter.emit(EVENT_AUTH_STATE_CHANGE, Object.assign({}, authState));
            devMode && log('emitted');
        };
        const finalPromise = (origPromise) => {
            return this._pending.updateAuthStatePromise.then(() => {
                const curPromise = this._pending.updateAuthStatePromise;
                if (curPromise && curPromise !== origPromise) {
                    return finalPromise(curPromise);
                }
                return this.getAuthState();
            });
        };
        if (this._pending.updateAuthStatePromise) {
            if (this._pending.canceledTimes >= MAX_PROMISE_CANCEL_TIMES) {
                devMode && log('terminated');
                return finalPromise(this._pending.updateAuthStatePromise);
            }
            else {
                this._pending.updateAuthStatePromise.cancel();
            }
        }
        const cancelablePromise = new PCancelable((resolve, _, onCancel) => {
            onCancel.shouldReject = false;
            onCancel(() => {
                this._pending.updateAuthStatePromise = null;
                this._pending.canceledTimes = this._pending.canceledTimes + 1;
                devMode && log('canceled');
            });
            const emitAndResolve = (authState) => {
                if (cancelablePromise.isCanceled) {
                    resolve();
                    return;
                }
                emitAuthStateChange(authState);
                resolve();
                this._pending = Object.assign({}, DEFAULT_PENDING);
            };
            this._sdk.isAuthenticated()
                .then(() => {
                if (cancelablePromise.isCanceled) {
                    resolve();
                    return;
                }
                const { accessToken, idToken, refreshToken } = this._sdk.tokenManager.getTokensSync();
                const authState = {
                    accessToken,
                    idToken,
                    refreshToken,
                    isAuthenticated: !!(accessToken && idToken)
                };
                const promise = transformAuthState
                    ? this._transformQueue.push(transformAuthState, null, this._sdk, authState)
                    : Promise.resolve(authState);
                promise
                    .then(authState => emitAndResolve(authState))
                    .catch(error => emitAndResolve({
                    accessToken,
                    idToken,
                    refreshToken,
                    isAuthenticated: false,
                    error
                }));
            });
        });
        this._pending.updateAuthStatePromise = cancelablePromise;
        return finalPromise(cancelablePromise);
    }
    subscribe(handler) {
        this._sdk.emitter.on(EVENT_AUTH_STATE_CHANGE, handler);
    }
    unsubscribe(handler) {
        this._sdk.emitter.off(EVENT_AUTH_STATE_CHANGE, handler);
    }
}

export { AuthStateManager, INITIAL_AUTH_STATE };
//# sourceMappingURL=AuthStateManager.js.map
