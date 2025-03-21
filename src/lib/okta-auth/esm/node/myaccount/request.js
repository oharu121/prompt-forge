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

import BaseTransaction from './transactions/Base.js';
import AuthSdkError from '../errors/AuthSdkError.js';
import '../errors/WWWAuthError.js';
import '../crypto/node.js';
import { httpRequest } from '../http/request.js';
import 'tiny-emitter';
import '../server/serverStorage.js';
import 'cross-fetch';

async function sendRequest(oktaAuth, options, TransactionClass = BaseTransaction) {
    const { accessToken: accessTokenObj } = oktaAuth.tokenManager.getTokensSync();
    const atToken = options.accessToken || accessTokenObj;
    const issuer = oktaAuth.getIssuerOrigin();
    const { url, method, payload } = options;
    const requestUrl = url.startsWith(issuer) ? url : `${issuer}${url}`;
    if (!atToken) {
        throw new AuthSdkError('AccessToken is required to request MyAccount API endpoints.');
    }
    let accessToken = atToken;
    const httpOptions = Object.assign({ headers: { 'Accept': '*/*;okta-version=1.0.0' }, url: requestUrl, method }, (payload && { args: payload }));
    if (oktaAuth.options.dpop) {
        if (typeof accessToken === 'string') {
            throw new AuthSdkError('AccessToken object must be provided when using dpop');
        }
        const { Authorization, Dpop } = await oktaAuth.getDPoPAuthorizationHeaders({
            method,
            url: requestUrl,
            accessToken
        });
        httpOptions.headers.Authorization = Authorization;
        httpOptions.headers.Dpop = Dpop;
    }
    else {
        accessToken = typeof accessToken === 'string' ? accessToken : accessToken.accessToken;
        httpOptions.accessToken = accessToken;
    }
    const res = await httpRequest(oktaAuth, httpOptions);
    let ret;
    if (Array.isArray(res)) {
        ret = res.map(item => new TransactionClass(oktaAuth, {
            res: item,
            accessToken
        }));
    }
    else {
        ret = new TransactionClass(oktaAuth, {
            res,
            accessToken
        });
    }
    return ret;
}
function generateRequestFnFromLinks({ oktaAuth, accessToken, methodName, links, }, TransactionClass = BaseTransaction) {
    for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
        if (method.toLowerCase() === methodName) {
            const link = links.self;
            return (async (payload) => sendRequest(oktaAuth, {
                accessToken,
                url: link.href,
                method,
                payload,
            }, TransactionClass));
        }
    }
    const link = links[methodName];
    if (!link) {
        throw new AuthSdkError(`No link is found with methodName: ${methodName}`);
    }
    return (async (payload) => sendRequest(oktaAuth, {
        accessToken,
        url: link.href,
        method: link.hints.allow[0],
        payload,
    }, TransactionClass));
}

export { generateRequestFnFromLinks, sendRequest };
//# sourceMappingURL=request.js.map
