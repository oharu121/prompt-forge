"use strict";

exports.clearTransactionMeta = clearTransactionMeta;
exports.createTransactionMeta = createTransactionMeta;
exports.getSavedTransactionMeta = getSavedTransactionMeta;
exports.getTransactionMeta = getTransactionMeta;
exports.hasSavedInteractionHandle = hasSavedInteractionHandle;
exports.isTransactionMetaValid = isTransactionMetaValid;
exports.isTransactionMetaValidForFlow = isTransactionMetaValidForFlow;
exports.isTransactionMetaValidForOptions = isTransactionMetaValidForOptions;
exports.saveTransactionMeta = saveTransactionMeta;
var _util = require("../util");
var _oidc = require("../oidc");
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/*!
 * Copyright (c) 2021, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

// Calculate new values
async function createTransactionMeta(authClient, options = {}) {
  const tokenParams = await authClient.token.prepareTokenParams(options);
  const pkceMeta = (0, _oidc.createOAuthMeta)(authClient, tokenParams);
  let {
    flow = 'default',
    withCredentials = true,
    activationToken = undefined,
    recoveryToken = undefined,
    maxAge = undefined,
    acrValues = undefined
  } = {
    ...authClient.options,
    ...options
  }; // local options override SDK options

  const meta = {
    ...pkceMeta,
    flow,
    withCredentials,
    activationToken,
    recoveryToken,
    maxAge,
    acrValues
  };
  return meta;
}
function hasSavedInteractionHandle(authClient, options) {
  const savedMeta = getSavedTransactionMeta(authClient, options);
  if (savedMeta?.interactionHandle) {
    return true;
  }
  return false;
}

// Returns the saved transaction meta, if it exists and is valid
function getSavedTransactionMeta(authClient, options) {
  options = (0, _util.removeNils)(options);
  options = {
    ...authClient.options,
    ...options
  }; // local options override SDK options
  let savedMeta;
  try {
    savedMeta = authClient.transactionManager.load(options);
  } catch (e) {
    // ignore errors here
  }
  if (!savedMeta) {
    return;
  }
  if (isTransactionMetaValid(savedMeta, options)) {
    return savedMeta;
  }

  // existing meta is not valid for this configuration
  // this is common when changing configuration in local development environment
  // in a production environment, this may indicate that two apps are sharing a storage key
  (0, _util.warn)('Saved transaction meta does not match the current configuration. ' + 'This may indicate that two apps are sharing a storage key.');
}
async function getTransactionMeta(authClient, options) {
  options = (0, _util.removeNils)(options);
  options = {
    ...authClient.options,
    ...options
  }; // local options override SDK options
  // Load existing transaction meta from storage
  const validExistingMeta = getSavedTransactionMeta(authClient, options);
  if (validExistingMeta) {
    return validExistingMeta;
  }
  // No existing? Create new transaction meta.
  return createTransactionMeta(authClient, options);
}
function saveTransactionMeta(authClient, meta) {
  authClient.transactionManager.save(meta, {
    muteWarning: true
  });
}
function clearTransactionMeta(authClient) {
  authClient.transactionManager.clear();
}
function isTransactionMetaValid(meta, options = {}) {
  // Validate against certain options. If these exist in options, they must match in meta
  const keys = ['issuer', 'clientId', 'redirectUri', 'state', 'codeChallenge', 'codeChallengeMethod', 'activationToken', 'recoveryToken'];
  if (isTransactionMetaValidForOptions(meta, options, keys) === false) {
    return false;
  }

  // Validate configured flow
  const {
    flow
  } = options;
  if (isTransactionMetaValidForFlow(meta, flow) === false) {
    return false;
  }
  return true;
}
function isTransactionMetaValidForFlow(meta, flow) {
  // Specific flows should not share transaction data
  const shouldValidateFlow = flow && flow !== 'default' && flow !== 'proceed';
  if (shouldValidateFlow) {
    if (flow !== meta.flow) {
      // The flow has changed; abandon the old transaction
      return false;
    }
  }
  return true;
}
function isTransactionMetaValidForOptions(meta, options, keys) {
  // returns false if values in meta do not match options
  // if the option does not have a value for a specific key, it is ignored
  const mismatch = keys.some(key => {
    const value = options[key];
    if (value && value !== meta[key]) {
      return true;
    }
  });
  return !mismatch;
}
//# sourceMappingURL=transactionMeta.js.map