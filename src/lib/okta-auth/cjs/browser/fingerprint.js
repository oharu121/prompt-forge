"use strict";

exports.default = fingerprint;
var _errors = require("../errors");
var _features = require("../features");
var _oidc = require("../oidc");
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

const isMessageFromCorrectSource = (iframe, event) => event.source === iframe.contentWindow;
function fingerprint(sdk, options) {
  if (!(0, _features.isFingerprintSupported)()) {
    return Promise.reject(new _errors.AuthSdkError('Fingerprinting is not supported on this device'));
  }
  const container = options?.container ?? document.body;
  let timeout;
  let iframe;
  let listener;
  const promise = new Promise(function (resolve, reject) {
    iframe = document.createElement('iframe');
    iframe.style.display = 'none';

    // eslint-disable-next-line complexity
    listener = function listener(e) {
      if (!isMessageFromCorrectSource(iframe, e)) {
        return;
      }
      if (!e || !e.data || e.origin !== sdk.getIssuerOrigin()) {
        return;
      }
      let msg;
      try {
        msg = JSON.parse(e.data);
      } catch (err) {
        // iframe messages should all be parsable
        // skip not parsable messages come from other sources in same origin (browser extensions)
        // TODO: add namespace flag in okta-core to distinguish messages that come from other sources
        return;
      }
      if (!msg) {
        return;
      }
      if (msg.type === 'FingerprintAvailable') {
        return resolve(msg.fingerprint);
      } else if (msg.type === 'FingerprintServiceReady') {
        iframe?.contentWindow?.postMessage(JSON.stringify({
          type: 'GetFingerprint'
        }), e.origin);
      } else {
        return reject(new _errors.AuthSdkError('No data'));
      }
    };
    (0, _oidc.addListener)(window, 'message', listener);
    iframe.src = sdk.getIssuerOrigin() + '/auth/services/devicefingerprint';
    container.appendChild(iframe);
    timeout = setTimeout(function () {
      reject(new _errors.AuthSdkError('Fingerprinting timed out'));
    }, options?.timeout || 15000);
  });
  return promise.finally(function () {
    clearTimeout(timeout);
    (0, _oidc.removeListener)(window, 'message', listener);
    if (container.contains(iframe)) {
      iframe.parentElement?.removeChild(iframe);
    }
  });
}
module.exports = exports.default;
//# sourceMappingURL=fingerprint.js.map