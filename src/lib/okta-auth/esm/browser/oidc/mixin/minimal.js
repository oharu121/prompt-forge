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

import { createBaseTokenAPI } from '../factory/baseApi.js';
import '../../errors/WWWAuthError.js';
import { isLoginRedirect, hasResponseType } from '../util/loginRedirect.js';
import '../../http/request.js';
import 'tiny-emitter';
import 'js-cookie';
import 'cross-fetch';
import '../types/Token.js';

function mixinMinimalOAuth(Base, TransactionManagerConstructor) {
    return class OktaAuthOAuth extends Base {
        constructor(...args) {
            super(...args);
            this.transactionManager = new TransactionManagerConstructor(Object.assign({
                storageManager: this.storageManager,
            }, this.options.transactionManager));
            this.token = createBaseTokenAPI(this);
        }
        isLoginRedirect() {
            return isLoginRedirect(this);
        }
        isPKCE() {
            return !!this.options.pkce;
        }
        hasResponseType(responseType) {
            return hasResponseType(responseType, this.options);
        }
        isAuthorizationCodeFlow() {
            return this.hasResponseType('code');
        }
    };
}

export { mixinMinimalOAuth };
//# sourceMappingURL=minimal.js.map
