export default class Observable {
  constructor() {
    this.lookup = {};
  }
  addEventListener(identifier, callback) {
    if(!(identifier in this.lookup)) {
      this.lookup[identifier] = [callback];
    } else {
      if(callback in this.lookup[identifier]) {
        // TODO: Emit warning that callback has already been registered
      } else {
        this.lookup[identifier].push(callback);
      }
    }
  }
  removeEventListener(identifier, callback) {
    if(identifier in this.lookup) {
      //  && callback in this.lookup[identifier]
      const index = this.lookup[identifier].findIndex(cb => cb === callback);
      if(index >= 0) {
        this.lookup[identifier].splice(index, 1);
      } else {
        // TODO: Emit warning that can't remove callback that hasn't been registered
      }
    } else {
      // TODO: Emit warning that can't remove callback that hasn't been registered
    }
  }
  dispatchEvent(identifier, eventData) {
    if(identifier in this.lookup) {
      this.lookup[identifier].forEach(callback => {
        callback(eventData);
      });
    }
  }
}