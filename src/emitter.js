const emitter = new Emitter();
const preconditions = new Preconditions();

export function off(...args) {
  return emitter.off(...args)
}

export function on(...args) {
  return emitter.on(...args)
}

export function once(...args) {
  return emitter.once(...args)
}

export function trigger(...args) {
  return emitter.trigger(...args)
}

/*
*********************************************************************************
* Emitter module with 4 main functions
* *******************************************************************************
* */

function Emitter() {}

Emitter.prototype.on = function (event, fn) {
  preconditions.shouldBeString(event, 'Event should be string');
  preconditions.shouldBeFunction(arguments.length, fn, 'function should be passed');

  this._events = this._events || {};
  (this._events['$' + event] = this._events['$' + event] || [])
    .push(fn);
  return this.listeners(event).length;
};

Emitter.prototype.once = function (event, fn) {
  preconditions.shouldBeString(event, 'Event should be string');
  preconditions.shouldBeFunction(arguments.length, fn, 'function should be passed');

  function onOnce() {
    this.off(event, onOnce);
    fn.apply(this, arguments);
  }

  onOnce.fn = fn;
  this.on(event, onOnce);
  return this.listeners(event).length;
};

Emitter.prototype.off = function (event, fn) {
  preconditions.shouldBeString(event, 'Event should be string');
  preconditions.shouldBeFunction(arguments.length, fn, 'function should be passed');

  this._events = this._events || {};

  // off all
  if (_.isEqual(arguments.length, 0)) {
    this._events = {};
    return this.listeners(event).length;
  }

  // off a specific event
  var events = this._events['$' + event];
  if (!events) return this.listeners(event).length;

  // delete the event and function
  if (_.isEqual(arguments.length,1)) {
    delete this._events['$' + event];
    return this.listeners(event).length;
  }

  // remove specific function
  for (var i = 0; i < events.length;) {
    let tempEvent = events[i];
    if (tempEvent === fn || tempEvent.fn === fn) {
      events.splice(i, 1);
      continue;
    }
    i++
  }
  return this.listeners(event).length;
};

Emitter.prototype.trigger = function (event) {
  preconditions.shouldBeString(event, 'Event should be string');

  this._events = this._events || {};
  let args = [].slice.call(arguments, 1)
    , events = this._events['$' + event];

  if (events) {
    events = events.slice(0);
    _.forEach(events, (event) => {
      event.apply(this, args);
    })
    return true;
  }
  return false;
};

Emitter.prototype.listeners = function (event) {
  this._events = this._events || {};
  return this._events['$' + event] || [];
};


/*
*******************************************************************************
* Preconditions check to check the input data type
* *****************************************************************************
* */

function Preconditions() {}

Preconditions.prototype.shouldBeString = (dataToCheck, message) => {
  if (!_.isEqual(dataToCheck.constructor, String)) {
    throw Error('IllegalArgumentException: ' + (message || ''));
  }
};

Preconditions.prototype.shouldBeFunction = (numberOfArguments, functionToCheck, message) => {
  if (numberOfArguments == 2 && typeof functionToCheck !== 'function') {
    throw Error('IllegalArgumentException: ' + (message || ''));
  }
};
