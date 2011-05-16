var jasmine;

function readFixtures() {
  return jasmine.getFixtures().proxyCallTo_('read', arguments);
}

function loadFixtures() {
  jasmine.getFixtures().proxyCallTo_('load', arguments);
}

function setFixtures(html) {
  jasmine.getFixtures().set(html);
}

function sandbox(attributes) {
  return jasmine.getFixtures().sandbox(attributes);
}

function spyOnEvent(selector, eventName) {
  jasmine.Prototype.events.spyOn(selector, eventName);
}

jasmine.getFixtures = function () {
  var fixtures = jasmine.currentFixtures_ = jasmine.currentFixtures_ || new jasmine.Fixtures();
  return fixtures;
};

jasmine.Fixtures = function () {
  this.containerId = 'jasmine-fixtures';
  this.fixturesCache_ = {};
  this.fixturesPath = 'spec/javascripts/fixtures';
};

jasmine.Fixtures.prototype.set = function (html) {
  this.cleanUp();
  this.createContainer_(html);
};

jasmine.Fixtures.prototype.load = function () {
  this.cleanUp();
  this.createContainer_(this.read.apply(this, arguments));
};

jasmine.Fixtures.prototype.read = function () {
  var htmlChunks = []
    , fixtureUrls = arguments
    , urlCount = fixtureUrls.length
    , urlIndex = 0;

  for (; urlIndex < urlCount; urlIndex++) {
    htmlChunks.push(this.getFixtureHtml_(fixtureUrls[urlIndex]));
  }

  return htmlChunks.join('');
};

jasmine.Fixtures.prototype.clearCache = function () {
  this.fixturesCache_ = {};
};

jasmine.Fixtures.prototype.cleanUp = function () {
  $(this.containerId).remove();
};

jasmine.Fixtures.prototype.sandbox = function (attributes) {
  var attributesToSet = attributes || {};
  attributesToSet.id = 'sandbox';
  return new Element('div', attributesToSet);
};

jasmine.Fixtures.prototype.createContainer_ = function (html) {
  var container = new Element('div', {id: this.containerId});
  container.update(html);
  $$('body')[0].insert(container);
};

jasmine.Fixtures.prototype.getFixtureHtml_ = function (url) {
  if (typeof this.fixturesCache_[url] === 'undefined') {
    this.loadFixtureIntoCache_(url);
  }
  return this.fixturesCache_[url];
};

jasmine.Fixtures.prototype.loadFixtureIntoCache_ = function (relativeUrl) {
  var self = this
    , url = this.fixturesPath.match('/$') ? this.fixturesPath + relativeUrl : this.fixturesPath + '/' + relativeUrl;

  new Ajax.Request(url, {
    asynchronous: false
  , onSuccess: function (data) {
      self.fixturesCache_[relativeUrl] = data;
    }
  });
};

jasmine.Fixtures.prototype.proxyCallTo_ = function (methodName, passedArguments) {
  return this[methodName].apply(this, passedArguments);
};


/* Prototype stuff */
jasmine.Prototype = function () {};

jasmine.Prototype.browserTagCaseIndependentHtml = function (html) {
  return new Element('div').insert(html).innerHTML();
};

jasmine.Prototype.elementToString = function (element) {
  return new Element('div').insert(Object.clone(element)).innerHTML();
};

jasmine.Prototype.matchersClass = {};

(function (namespace) {
  var data = {
    spiedEvents: {}
  , handlers: []
  };

  namespace.events = {
    spyOn: function (element, eventName) {
      var handler = function (e) {
        data.spiedEvents[[element, eventName]] = e;
      };
      Event.observe(element, eventName, handler);
      data.handlers.push(handler);
    }

  , wasTriggered: function (selector, eventName) {
      return !!(data.spiedEvents[[selector, eventName]]);
    }

  , cleanUp: function () {
      data.spiedEvents = {};
      data.handlers = [];
    }
  }
}(jasmine.Prototype));

(function (){
  var jQueryMatchers = {
    toHaveClass: function(className) {
      return this.actual.hasClass(className);
    },

    toBeVisible: function() {
      return this.actual.is(':visible');
    },

    toBeHidden: function() {
      return this.actual.is(':hidden');
    },

    toBeSelected: function() {
      return this.actual.is(':selected');
    },

    toBeChecked: function() {
      return this.actual.is(':checked');
    },

    toBeEmpty: function() {
      return this.actual.is(':empty');
    },

    toExist: function() {
      return this.actual.size() > 0;
    },

    toHaveAttr: function(attributeName, expectedAttributeValue) {
      return hasProperty(this.actual.attr(attributeName), expectedAttributeValue);
    },

    toHaveId: function(id) {
      return this.actual.attr('id') == id;
    },

    toHaveHtml: function(html) {
      return this.actual.html() == jasmine.Prototype.browserTagCaseIndependentHtml(html);
    },

    toHaveText: function(text) {
      if (text && jQuery.isFunction(text.test)) {
        return text.test(this.actual.text());
      } else {
        return this.actual.text() == text;
      }
    },

    toHaveValue: function(value) {
      return this.actual.val() == value;
    },

    toHaveData: function(key, expectedValue) {
      return hasProperty(this.actual.data(key), expectedValue);
    },

    toBe: function(selector) {
      return this.actual.is(selector);
    },

    toContain: function(selector) {
      return this.actual.find(selector).size() > 0;
    },

    toBeDisabled: function(selector){
      return this.actual.is(':disabled');
    },

    // tests the existence of a specific event binding
    toHandle: function(eventName) {
      var events = this.actual.data("events");
      return events && events[eventName].length > 0;
    },
    
    // tests the existence of a specific event binding + handler
    toHandleWith: function(eventName, eventHandler) {
      var stack = this.actual.data("events")[eventName];
      var i;
      for (i = 0; i < stack.length; i++) {
        if (stack[i].handler == eventHandler) {
          return true;
        }
      }
      return false;
    }
  };

  var hasProperty = function(actualValue, expectedValue) {
    if (expectedValue === undefined) {
      return actualValue !== undefined;
    }
    return actualValue == expectedValue;
  };

  var bindMatcher = function(methodName) {
    var builtInMatcher = jasmine.Matchers.prototype[methodName];

    jasmine.Prototype.matchersClass[methodName] = function() {
      if (this.actual instanceof jQuery) {
        var result = jQueryMatchers[methodName].apply(this, arguments);
        this.actual = jasmine.Prototype.elementToString(this.actual);
        return result;
      }

      if (builtInMatcher) {
        return builtInMatcher.apply(this, arguments);
      }

      return false;
    };
  };

  for(var methodName in jQueryMatchers) {
    bindMatcher(methodName);
  }
})();

beforeEach(function() {
  this.addMatchers(jasmine.Prototype.matchersClass);
  this.addMatchers({
    toHaveBeenTriggeredOn: function(selector) {
      this.message = function() {
        return [
          "Expected event " + this.actual + " to have been triggered on" + selector,
          "Expected event " + this.actual + " not to have been triggered on" + selector
        ];
      };
      return jasmine.Prototype.events.wasTriggered(selector, this.actual);
    }
  })
});

afterEach(function() {
  jasmine.getFixtures().cleanUp();
  jasmine.Prototype.events.cleanUp();
});
