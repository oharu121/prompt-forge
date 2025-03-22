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
import { clone } from '../util/object.js';
import { getToken } from './getToken.js';
import { loadPopup } from './util/browser.js';
import '../crypto/node.js';
import '../http/request.js';
import 'tiny-emitter';
import '../server/serverStorage.js';
import 'cross-fetch';
import './types/Token.js';

function getWithPopup(sdk, options) {
    if (arguments.length > 2) {
        return Promise.reject(new AuthSdkError('As of version 3.0, "getWithPopup" takes only a single set of options'));
    }
    const popupWindow = loadPopup('/', options);
    options = clone(options) || {};
    Object.assign(options, {
        display: 'popup',
        responseMode: 'okta_post_message',
        popupWindow
    });
    return getToken(sdk, options);
}

export { getWithPopup };
//# sourceMappingURL=getWithPopup.js.map
