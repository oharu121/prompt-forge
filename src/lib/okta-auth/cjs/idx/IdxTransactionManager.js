"use strict";

exports.createIdxTransactionManager = createIdxTransactionManager;
var _TransactionManager = require("../oidc/TransactionManager");
var _idxJs = require("./types/idx-js");
function createIdxTransactionManager() {
  const TransactionManager = (0, _TransactionManager.createTransactionManager)();
  return class IdxTransactionManager extends TransactionManager {
    constructor(options) {
      super(options);
    }
    clear(options = {}) {
      super.clear(options);
      if (options.clearIdxResponse !== false) {
        this.clearIdxResponse();
      }
    }
    saveIdxResponse(data) {
      if (!this.saveLastResponse) {
        return;
      }
      const storage = this.storageManager.getIdxResponseStorage();
      if (!storage) {
        return;
      }
      storage.setStorage(data);
    }

    // eslint-disable-next-line complexity
    loadIdxResponse(options) {
      if (!this.saveLastResponse) {
        return null;
      }
      const storage = this.storageManager.getIdxResponseStorage();
      if (!storage) {
        return null;
      }
      const storedValue = storage.getStorage();
      if (!storedValue || !(0, _idxJs.isRawIdxResponse)(storedValue.rawIdxResponse)) {
        return null;
      }
      if (options) {
        const {
          stateHandle,
          interactionHandle
        } = options;
        // only perform this check if NOT using generic remediator
        if (!options.useGenericRemediator && stateHandle && storedValue.stateHandle !== stateHandle) {
          return null;
        }
        if (interactionHandle && storedValue.interactionHandle !== interactionHandle) {
          return null;
        }
      }
      return storedValue;
    }
    clearIdxResponse() {
      if (!this.saveLastResponse) {
        return;
      }
      const storage = this.storageManager.getIdxResponseStorage();
      storage?.clearStorage();
    }
  };
}
//# sourceMappingURL=IdxTransactionManager.js.map