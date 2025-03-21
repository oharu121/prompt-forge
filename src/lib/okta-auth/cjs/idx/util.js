"use strict";

exports.canResendFn = canResendFn;
exports.canSkipFn = canSkipFn;
exports.filterValuesForRemediation = filterValuesForRemediation;
exports.getAvailableSteps = getAvailableSteps;
exports.getEnabledFeatures = getEnabledFeatures;
exports.getFlowSpecification = getFlowSpecification;
exports.getMessagesFromIdxRemediationValue = getMessagesFromIdxRemediationValue;
exports.getMessagesFromResponse = getMessagesFromResponse;
exports.getNextStep = getNextStep;
exports.getRemediator = getRemediator;
exports.handleFailedResponse = handleFailedResponse;
exports.isTerminalResponse = isTerminalResponse;
exports.setRemediatorsCtx = setRemediatorsCtx;
var _util = require("../util");
var _GenericRemediator = require("./remediators/GenericRemediator");
var _types = require("./types");
const ctx = {
  // default values to be used by minimal IDX API
  remediators: {},
  getFlowSpecification: function (_oktaAuth, _flow = 'default') {
    return {
      remediators: {}
    };
  }
};

// should be set in createIdxAPI() factory
function setRemediatorsCtx(newCtx) {
  Object.assign(ctx, newCtx);
}
function getFlowSpecification(oktaAuth, flow = 'default') {
  return ctx.getFlowSpecification(oktaAuth, flow);
}
function isTerminalResponse(idxResponse) {
  const {
    neededToProceed,
    interactionCode
  } = idxResponse;
  return !neededToProceed.length && !interactionCode;
}
function canSkipFn(idxResponse) {
  return idxResponse.neededToProceed.some(({
    name
  }) => name === 'skip');
}
function canResendFn(idxResponse) {
  return Object.keys(idxResponse.actions).some(actionName => actionName.includes('resend'));
}
function getMessagesFromIdxRemediationValue(value) {
  if (!value || !Array.isArray(value)) {
    return;
  }
  return value.reduce((messages, value) => {
    if (value.messages) {
      messages = [...messages, ...value.messages.value];
    }
    if (value.form) {
      const messagesFromForm = getMessagesFromIdxRemediationValue(value.form.value) || [];
      messages = [...messages, ...messagesFromForm];
    }
    if (value.options) {
      let optionValues = [];
      value.options.forEach(option => {
        if (!option.value || typeof option.value === 'string') {
          return;
        }
        optionValues = [...optionValues, option.value];
      });
      const messagesFromOptions = getMessagesFromIdxRemediationValue(optionValues) || [];
      messages = [...messages, ...messagesFromOptions];
    }
    return messages;
  }, []);
}
function getMessagesFromResponse(idxResponse, options) {
  let messages = [];
  const {
    rawIdxState,
    neededToProceed
  } = idxResponse;

  // Handle global messages
  const globalMessages = rawIdxState.messages?.value.map(message => message);
  if (globalMessages) {
    messages = [...messages, ...globalMessages];
  }

  // Handle field messages for current flow
  // Preserve existing logic for general cases, remove in the next major version
  // Follow ion response format for top level messages when useGenericRemediator is true
  if (!options.useGenericRemediator) {
    for (let remediation of neededToProceed) {
      const fieldMessages = getMessagesFromIdxRemediationValue(remediation.value);
      if (fieldMessages) {
        messages = [...messages, ...fieldMessages];
      }
    }
  }

  // API may return identical error on same field, filter by i18n key
  const seen = {};
  messages = messages.reduce((filtered, message) => {
    const key = message.i18n?.key;
    if (key && seen[key] && message.message === seen[key].message) {
      return filtered;
    }
    seen[key] = message;
    filtered = [...filtered, message];
    return filtered;
  }, []);
  return messages;
}
function getEnabledFeatures(idxResponse) {
  const res = [];
  const {
    actions,
    neededToProceed
  } = idxResponse;
  if (actions['currentAuthenticator-recover']) {
    res.push(_types.IdxFeature.PASSWORD_RECOVERY);
  }
  if (neededToProceed.some(({
    name
  }) => name === 'select-enroll-profile')) {
    res.push(_types.IdxFeature.REGISTRATION);
  }
  if (neededToProceed.some(({
    name
  }) => name === 'redirect-idp')) {
    res.push(_types.IdxFeature.SOCIAL_IDP);
  }
  if (neededToProceed.some(({
    name
  }) => name === 'unlock-account')) {
    res.push(_types.IdxFeature.ACCOUNT_UNLOCK);
  }
  return res;
}
function getAvailableSteps(authClient, idxResponse, useGenericRemediator) {
  const res = [];
  const remediatorMap = Object.values(ctx.remediators).reduce((map, remediatorClass) => {
    // Only add concrete subclasses to the map
    if (remediatorClass.remediationName) {
      map[remediatorClass.remediationName] = remediatorClass;
    }
    return map;
  }, {});
  for (let remediation of idxResponse.neededToProceed) {
    const T = getRemediatorClass(remediation, {
      useGenericRemediator,
      remediators: remediatorMap
    });
    if (T) {
      const remediator = new T(remediation);
      res.push(remediator.getNextStep(authClient, idxResponse.context));
    }
  }
  for (const [name] of Object.entries(idxResponse.actions || {})) {
    let stepObj = {
      name,
      action: async params => {
        return authClient.idx.proceed({
          actions: [{
            name,
            params
          }]
        });
      }
    };
    if (name.startsWith('currentAuthenticator')) {
      const [part1, part2] = (0, _util.split2)(name, '-');
      const actionObj = idxResponse.rawIdxState[part1].value[part2];
      /* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
      const {
        href,
        method,
        rel,
        accepts,
        produces,
        ...rest
      } = actionObj;
      /* eslint-enable no-unused-vars, @typescript-eslint/no-unused-vars */
      const value = actionObj.value?.filter(item => item.name !== 'stateHandle');
      stepObj = {
        ...rest,
        ...(value && {
          value
        }),
        ...stepObj
      };
    }
    res.push(stepObj);
  }
  return res;
}
function filterValuesForRemediation(idxResponse, remediationName, values) {
  const remediations = idxResponse.neededToProceed || [];
  const remediation = remediations.find(r => r.name === remediationName);
  if (!remediation) {
    // step was specified, but remediation was not found. This is unexpected!
    (0, _util.warn)(`filterValuesForRemediation: "${remediationName}" did not match any remediations`);
    return values;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const valuesForRemediation = remediation.value.reduce((res, entry) => {
    const {
      name,
      value
    } = entry;
    if (name === 'stateHandle') {
      res[name] = value; // use the stateHandle value in the remediation
    } else {
      res[name] = values[name]; // use the value provided by the caller
    }

    return res;
  }, {});
  return valuesForRemediation;
}
function getRemediatorClass(remediation, options) {
  const {
    useGenericRemediator,
    remediators
  } = options;
  if (!remediation) {
    return undefined;
  }
  if (useGenericRemediator) {
    return _GenericRemediator.GenericRemediator;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return remediators[remediation.name];
}

// Return first match idxRemediation in allowed remediators
// eslint-disable-next-line complexity
function getRemediator(idxResponse, values, options) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const remediators = options.remediators;
  const useGenericRemediator = options.useGenericRemediator;
  const {
    neededToProceed: idxRemediations,
    context
  } = idxResponse;
  let remediator;
  // remediation name specified by caller - fast-track remediator lookup 
  if (options.step) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const remediation = idxRemediations.find(({
      name
    }) => name === options.step);
    if (remediation) {
      const T = getRemediatorClass(remediation, options);
      return T ? new T(remediation, values, options) : undefined;
    } else {
      // step was specified, but remediation was not found. This is unexpected!
      (0, _util.warn)(`step "${options.step}" did not match any remediations`);
      return;
    }
  }
  const remediatorCandidates = [];
  if (useGenericRemediator) {
    // always pick the first remediation for when use GenericRemediator
    remediatorCandidates.push(new _GenericRemediator.GenericRemediator(idxRemediations[0], values, options));
  } else {
    for (let remediation of idxRemediations) {
      const isRemeditionInFlow = Object.keys(remediators).includes(remediation.name);
      if (!isRemeditionInFlow) {
        continue;
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const T = getRemediatorClass(remediation, options);
      remediator = new T(remediation, values, options);
      if (remediator.canRemediate(context)) {
        // found the remediator
        return remediator;
      }
      // remediator cannot handle the current values
      // maybe return for next step
      remediatorCandidates.push(remediator);
    }
  }
  return remediatorCandidates[0];
}
function getNextStep(authClient, remediator, idxResponse) {
  const nextStep = remediator.getNextStep(authClient, idxResponse.context);
  const canSkip = canSkipFn(idxResponse);
  const canResend = canResendFn(idxResponse);
  return {
    ...nextStep,
    ...(canSkip && {
      canSkip
    }),
    ...(canResend && {
      canResend
    })
  };
}
function handleFailedResponse(authClient, idxResponse, options = {}) {
  const terminal = isTerminalResponse(idxResponse);
  const messages = getMessagesFromResponse(idxResponse, options);
  if (terminal) {
    return {
      idxResponse,
      terminal,
      messages
    };
  } else {
    const remediator = getRemediator(idxResponse, {}, options);
    const nextStep = remediator && getNextStep(authClient, remediator, idxResponse);
    return {
      idxResponse,
      messages,
      ...(nextStep && {
        nextStep
      })
    };
  }
}
//# sourceMappingURL=util.js.map