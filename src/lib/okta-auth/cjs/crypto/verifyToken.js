"use strict";

exports.verifyToken = verifyToken;
var _util = require("../util");
var _base = require("./base64");
var _webcrypto = require("./webcrypto");
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

function verifyToken(idToken, key) {
  key = (0, _util.clone)(key);
  var format = 'jwk';
  var algo = {
    name: 'RSASSA-PKCS1-v1_5',
    hash: {
      name: 'SHA-256'
    }
  };
  var extractable = true;
  var usages = ['verify'];

  // https://connect.microsoft.com/IE/feedback/details/2242108/webcryptoapi-importing-jwk-with-use-field-fails
  // This is a metadata tag that specifies the intent of how the key should be used.
  // It's not necessary to properly verify the jwt's signature.
  delete key.use;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return _webcrypto.webcrypto.subtle.importKey(format, key, algo, extractable, usages).then(function (cryptoKey) {
    var jwt = idToken.split('.');
    var payload = (0, _base.stringToBuffer)(jwt[0] + '.' + jwt[1]);
    var b64Signature = (0, _base.base64UrlDecode)(jwt[2]);
    var signature = (0, _base.stringToBuffer)(b64Signature);
    return _webcrypto.webcrypto.subtle.verify(algo, cryptoKey, signature, payload);
  });
}
//# sourceMappingURL=verifyToken.js.map