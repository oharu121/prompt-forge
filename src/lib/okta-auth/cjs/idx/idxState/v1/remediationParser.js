"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.generateRemediationFunctions = void 0;
var _generateIdxAction = _interopRequireDefault(require("./generateIdxAction"));
/*!
 * Copyright (c) 2021-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

// auth-js/types

const generateRemediationFunctions = function generateRemediationFunctions(authClient, remediationValue, toPersist = {}) {
  return remediationValue.reduce((obj, remediation) => ({
    ...obj,
    [remediation.name]: (0, _generateIdxAction.default)(authClient, remediation, toPersist)
  }), {});
};
exports.generateRemediationFunctions = generateRemediationFunctions;
//# sourceMappingURL=remediationParser.js.map