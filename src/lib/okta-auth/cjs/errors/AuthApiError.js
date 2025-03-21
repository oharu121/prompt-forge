"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.default = void 0;
var _CustomError = _interopRequireDefault(require("./CustomError"));
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

class AuthApiError extends _CustomError.default {
  constructor(err, xhr, meta) {
    const message = err.errorSummary;
    super(message);
    this.name = 'AuthApiError';
    this.errorSummary = err.errorSummary;
    this.errorCode = err.errorCode;
    this.errorLink = err.errorLink;
    this.errorId = err.errorId;
    this.errorCauses = err.errorCauses;
    if (xhr) {
      this.xhr = xhr;
    }
    if (meta) {
      this.meta = meta;
    }
  }
}
exports.default = AuthApiError;
module.exports = exports.default;
//# sourceMappingURL=AuthApiError.js.map