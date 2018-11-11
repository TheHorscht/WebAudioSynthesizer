export class Observable {
  static staticLookup = {};

  constructor() {
    this.lookup = {};
  }
  addEventListener(identifier, callback) {
    if (!(identifier in this.lookup)) {
      this.lookup[identifier] = [callback];
    } else {
      if (callback in this.lookup[identifier]) {
        // TODO: Emit warning that callback has already been registered
      } else {
        this.lookup[identifier].push(callback);
      }
    }
  }
  removeEventListener(identifier, callback) {
    if (identifier in this.lookup) {
      //  && callback in this.lookup[identifier]
      const index = this.lookup[identifier].findIndex(cb => cb === callback);
      if (index >= 0) {
        this.lookup[identifier].splice(index, 1);
      } else {
        // TODO: Emit warning that can't remove callback that hasn't been registered
      }
    } else {
      // TODO: Emit warning that can't remove callback that hasn't been registered
    }
  }
  dispatchEvent(identifier, eventData) {
    if (identifier in this.lookup) {
      this.lookup[identifier].forEach(callback => {
        callback(eventData);
      });
    }
  }

  static createObservableMember(propName, defaultValue) {
    Observable.staticLookup[this.name] =
      Observable.staticLookup[this.name] || {};
    let val = defaultValue;
    Object.defineProperty(
      this.prototype.constructor.prototype.constructor,
      propName,
      {
        get: () => val,
        set: newVal => {
          val = newVal;
          this.dispatchEvent(`${propName}Changed`, newVal);
        },
      },
    );
  }
  static addEventListener(identifier, callback) {
    if (!(identifier in Observable.staticLookup[this.name])) {
      Observable.staticLookup[this.name][identifier] = [callback];
    } else {
      if (callback in Observable.staticLookup[this.name][identifier]) {
        // TODO: Emit warning that callback has already been registered
      } else {
        Observable.staticLookup[this.name][identifier].push(callback);
      }
    }
  }
  static removeEventListener(identifier, callback) {
    if (identifier in Observable.staticLookup[this.name]) {
      //  && callback in this.lookup[identifier]
      const index = Observable.staticLookup[this.name][identifier].findIndex(
        cb => cb === callback,
      );
      if (index >= 0) {
        Observable.staticLookup[this.name][identifier].splice(index, 1);
      } else {
        // TODO: Emit warning that can't remove callback that hasn't been registered
      }
    } else {
      // TODO: Emit warning that can't remove callback that hasn't been registered
    }
  }
  static dispatchEvent(identifier, eventData) {
    if (identifier in Observable.staticLookup[this.name]) {
      Observable.staticLookup[this.name][identifier].forEach(callback => {
        callback(eventData);
      });
    }
  }
}
