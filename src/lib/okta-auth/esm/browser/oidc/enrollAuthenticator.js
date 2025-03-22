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

import { clone } from '../util/object.js';
import '../errors/WWWAuthError.js';
import { createEnrollAuthenticatorMeta } from './util/enrollAuthenticatorMeta.js';
import '../http/request.js';
import 'tiny-emitter';
import 'js-cookie';
import 'cross-fetch';
import { prepareEnrollAuthenticatorParams } from './util/prepareEnrollAuthenticatorParams.js';
import './types/Token.js';
import { buildAuthorizeParams } from './endpoints/authorize.js';

function enrollAuthenticator(sdk, options) {
    options = clone(options) || {};
    const params = prepareEnrollAuthenticatorParams(sdk, options);
    const meta = createEnrollAuthenticatorMeta(sdk, params);
    const requestUrl = meta.urls.authorizeUrl + buildAuthorizeParams(params);
    sdk.transactionManager.save(meta);
    if (sdk.options.setLocation) {
        sdk.options.setLocation(requestUrl);
    }
    else {
        window.location.assign(requestUrl);
    }
}

export { enrollAuthenticator };
//# sourceMappingURL=enrollAuthenticator.js.map
