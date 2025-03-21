"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.EnrollPoll = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _Remediator = require("./Base/Remediator");
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

class EnrollPoll extends _Remediator.Remediator {
  canRemediate() {
    return !!this.values.startPolling || this.options.step === 'enroll-poll';
  }
  getNextStep(authClient, context) {
    const common = super.getNextStep(authClient, context);
    let authenticator = this.getAuthenticator();
    if (!authenticator && context?.currentAuthenticator) {
      authenticator = context.currentAuthenticator.value;
    }
    return {
      ...common,
      authenticator,
      poll: {
        required: true,
        refresh: this.remediation.refresh
      }
    };
  }
  getValuesAfterProceed() {
    let trimmedValues = Object.keys(this.values).filter(valueKey => valueKey !== 'startPolling');
    return trimmedValues.reduce((values, valueKey) => ({
      ...values,
      [valueKey]: this.values[valueKey]
    }), {});
  }
}
exports.EnrollPoll = EnrollPoll;
(0, _defineProperty2.default)(EnrollPoll, "remediationName", 'enroll-poll');
//# sourceMappingURL=EnrollPoll.js.map