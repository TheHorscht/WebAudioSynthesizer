class MyWorkletNode extends AudioWorkletNode {
  constructor(context) {
    super(context, 'my-worklet-processor');
    this.messageCallbacks = [];
    this.port.onmessage = event => {    
      const callbackEntryIndex = this.messageCallbacks.findIndex(
         v => v.cmd === event.data.cmd && v.id === event.data.id);
      if(callbackEntryIndex > -1) {
        this.messageCallbacks[callbackEntryIndex].func(event.data.result);
        this.messageCallbacks.splice(callbackEntryIndex, 1);
      }
    };
  }
  _waitForMessage({ cmd, id }) {
    return new Promise((success, failue) => {
      this.messageCallbacks.push({ cmd, id, func: success });
    });
  }
  getBuffer() {
    return new Promise((success, failure) => {
      const newId = generateNewId();
      this.port.postMessage({ cmd: 'GetBuffer', id: newId});
      this._waitForMessage({ cmd: 'GetBuffer', id: newId}).then(success);
    });
  }
}

let id = 0;
function generateNewId() {
  return id++;
}