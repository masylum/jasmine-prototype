var jasmine, describe, it, beforeEach, spyOn, expect, readFixtures, loadFixtures, setFixtures, sandbox;

describe("jasmine.Fixtures", function  () {
  // make ajaxData look like the real Prototype response
  var ajaxData = { responseText: 'some ajax data' }
    , fixtureUrl = 'some_url'
    , anotherFixtureUrl = 'another_url'
    , ajaxCalls = 0
    , ajaxMostRecent = null
    , fixturesContainer = function  () {
        return $(jasmine.getFixtures().containerId);
      }
    , appendFixturesContainerToDom = function  () {
        $$('body')[0].insert('<div id="' + jasmine.getFixtures().containerId + '">old content</div>');
      };

  beforeEach(function  () {
    jasmine.getFixtures().clearCache();
    spyOn(jasmine.getFixtures(), 'requestFixture_').andCallFake(function (url, callback) {
      ajaxCalls += 1;
      ajaxMostRecent = [url, callback];
      callback(ajaxData);
    });
  });

  describe("default initial config values", function () {
    it("should set 'jasmine-fixtures' as the default container id", function () {
      expect(jasmine.getFixtures().containerId).toEqual('jasmine-fixtures');
    });

    it("should set 'spec/javascripts/fixtures' as the default fixtures path", function () {
      expect(jasmine.getFixtures().fixturesPath).toEqual('spec/javascripts/fixtures');
    });
  });

  describe("cache", function () {
    describe("clearCache", function () {
      it("should clear cache and in effect force subsequent AJAX call", function () {
        ajaxCalls = 0;
        jasmine.getFixtures().read(fixtureUrl);
        jasmine.getFixtures().clearCache();
        jasmine.getFixtures().read(fixtureUrl);
        expect(ajaxCalls).toEqual(2);
      });
    });

    it("first-time read should go through AJAX", function () {
      ajaxCalls = 0;
      jasmine.getFixtures().read(fixtureUrl);
      expect(ajaxCalls).toEqual(1);
    });

    it("subsequent read from the same URL should go from cache", function () {
      ajaxCalls = 0;
      jasmine.getFixtures().read(fixtureUrl, fixtureUrl);
      expect(ajaxCalls).toEqual(1);
    });
  });

  describe("read", function () {
    it("should return fixture HTML", function () {
      var html = jasmine.getFixtures().read(fixtureUrl);
      expect(html).toEqual(ajaxData.responseText);
    });

    it("should return duplicated HTML of a fixture when its url is provided twice in a single call", function () {
      var html = jasmine.getFixtures().read(fixtureUrl, fixtureUrl);
      expect(html).toEqual(ajaxData.responseText + ajaxData.responseText);
    });

    it("should return merged HTML of two fixtures when two different urls are provided in a single call", function () {
      var html = jasmine.getFixtures().read(fixtureUrl, anotherFixtureUrl);
      expect(html).toEqual(ajaxData.responseText + ajaxData.responseText);
    });

    it("should have shortcut global method readFixtures", function () {
      var html = readFixtures(fixtureUrl, anotherFixtureUrl);
      expect(html).toEqual(ajaxData.responseText + ajaxData.responseText);
    });

    it("should use the configured fixtures path concatenating it to the requested url (without concatenating a slash if it already has an ending one)", function () {
      ajaxMostRecent = null;
      jasmine.getFixtures().fixturesPath = 'a path ending with slash/';
      readFixtures(fixtureUrl);
      expect(ajaxMostRecent[0]).toEqual('a path ending with slash/' + fixtureUrl);
    });

    it("should use the configured fixtures path concatenating it to the requested url (concatenating a slash if it doesn't have an ending one)", function () {
      ajaxMostRecent = null;
      jasmine.getFixtures().fixturesPath = 'a path without an ending slash';
      readFixtures(fixtureUrl);
      expect(ajaxMostRecent[0]).toEqual('a path without an ending slash/' + fixtureUrl);
    });
  });

  describe("load", function () {
    it("should insert fixture HTML into container", function () {
      jasmine.getFixtures().load(fixtureUrl);
      expect(fixturesContainer().innerHTML).toEqual(ajaxData.responseText);
    });

    it("should insert duplicated fixture HTML into container when the same url is provided twice in a single call", function () {
      jasmine.getFixtures().load(fixtureUrl, fixtureUrl);
      expect(fixturesContainer().innerHTML).toEqual(ajaxData.responseText + ajaxData.responseText);
    });

    it("should insert merged HTML of two fixtures into container when two different urls are provided in a single call", function () {
      jasmine.getFixtures().load(fixtureUrl, anotherFixtureUrl);
      expect(fixturesContainer().innerHTML).toEqual(ajaxData.responseText + ajaxData.responseText);
    });

    it("should have shortcut global method loadFixtures", function () {
      loadFixtures(fixtureUrl, anotherFixtureUrl);
      expect(fixturesContainer().innerHTML).toEqual(ajaxData.responseText + ajaxData.responseText);
    });

    describe("when fixture container does not exist", function () {
      it("should automatically create fixtures container and append it to DOM", function () {
        jasmine.getFixtures().load(fixtureUrl);
        expect(fixturesContainer()).toBeTruthy(1);
      });
    });

    describe("when fixture container exists", function () {
      beforeEach(function () {
        appendFixturesContainerToDom();
      });

      it("should replace it with new content", function () {
        jasmine.getFixtures().load(fixtureUrl);
        expect(fixturesContainer().innerHTML).toEqual(ajaxData.responseText);
      });
    });
  });

  describe("set", function () {
    var html = '<div>some HTML</div>';

    it("should insert HTML into container", function () {
      jasmine.getFixtures().set(html);
      expect(fixturesContainer().innerHTML).toEqual(jasmine.Prototype.browserTagCaseIndependentHtml(html));
    });

    it("should have shortcut global method setFixtures", function () {
      setFixtures(html);
      expect(fixturesContainer().innerHTML).toEqual(jasmine.Prototype.browserTagCaseIndependentHtml(html));
    });

    describe("when fixture container does not exist", function () {
      it("should automatically create fixtures container and append it to DOM", function () {
        jasmine.getFixtures().set(html);
        expect(fixturesContainer()).toBeTruthy();
      });
    });

    describe("when fixture container exists", function () {
      beforeEach(function () {
        appendFixturesContainerToDom();
      });

      it("should replace it with new content", function () {
        jasmine.getFixtures().set(html);
        expect(fixturesContainer().innerHTML).toEqual(jasmine.Prototype.browserTagCaseIndependentHtml(html));
      });
    });
  });

  describe("sandbox", function () {
    describe("with no attributes parameter specified", function () {
      it("should create DIV with id #sandbox", function () {
        expect(jasmine.getFixtures().sandbox().innerHTML).toEqual('');
        expect(jasmine.getFixtures().sandbox().id).toEqual('sandbox');
        expect(jasmine.getFixtures().sandbox().tagName).toEqual('DIV');
      });
    });

    describe("with attributes parameter specified", function () {
      it("should create DIV with attributes", function () {
        var attributes = { attr1: 'attr1 value'
                         , attr2: 'attr2 value' }
          , element = $(jasmine.getFixtures().sandbox(attributes));

        expect(element.readAttribute('attr1')).toEqual(attributes.attr1);
        expect(element.readAttribute('attr2')).toEqual(attributes.attr2);
      });

      it("should be able to override id by setting it as attribute", function () {
        var idOverride = 'overridden'
          , element = $(jasmine.getFixtures().sandbox({id: idOverride}));

        expect(element.readAttribute('id')).toEqual(idOverride);
      });
    });

    it("should have shortcut global method sandbox", function () {
      var attributes = {id: 'overridden'}
        , element = $(sandbox(attributes));

      expect(element.readAttribute('id')).toEqual(attributes.id);
    });
  });

  describe("cleanUp", function () {
    it("should remove fixtures container from DOM", function () {
      appendFixturesContainerToDom();
      jasmine.getFixtures().cleanUp();
      expect(fixturesContainer()).toBeFalsy();
    });
  });

  // WARNING: this block requires its two tests to be invoked in order!
  // (Really ugly solution, but unavoidable in this specific case)
  describe("automatic DOM clean-up between tests", function () {
    // WARNING: this test must be invoked first (before 'SECOND TEST')!
    it("FIRST TEST: should pollute the DOM", function () {
      appendFixturesContainerToDom();
    });

    // WARNING: this test must be invoked second (after 'FIRST TEST')!
    it("SECOND TEST: should see the DOM in a blank state", function () {
      expect(fixturesContainer()).toBeFalsy();
    });
  });
});

describe("prototype matchers", function () {
  //describe("when prototype matcher hides original Jasmine matcher", function () {
  //  describe("and tested item is prototype object", function () {
  //    it("should invoke prototype version of matcher", function () {
  //      expect($('<div />')).toBe('div');
  //    });
  //  });

  //  describe("and tested item is not prototype object", function () {
  //    it("should invoke original version of matcher", function () {
  //      expect(true).toBe(true);
  //    });
  //  });
  //});

  describe("when prototype matcher does not hide any original Jasmine matcher", function () {
    describe("and tested item in not prototype object", function () {
      it("should pass negated", function () {
        expect({}).not.toHaveClass("some-class");
      });
    });
  });

  describe("when invoked multiple times on the same fixture", function () {
    it("should not reset fixture after first call", function () {
      setFixtures(sandbox());
      expect($('sandbox')).toExist();
      expect($('sandbox')).toExist();
    });
  });

  describe("toHaveClass", function () {
    var className = "some-class";

    it("should pass when class found", function () {
      setFixtures(sandbox({'class': className}));
      expect($('sandbox')).toHaveClass(className);
    });

    it("should pass negated when class not found", function () {
      setFixtures(sandbox());
      expect($('sandbox')).not.toHaveClass(className);
    });
  });

  describe("toHaveAttr", function () {
    var attributeName = 'attr1'
      , attributeValue = 'attr1 value'
      , wrongAttributeName = 'wrongName'
      , wrongAttributeValue = 'wrong value';

    beforeEach(function () {
      var attributes = {};
      attributes[attributeName] = attributeValue;
      setFixtures(sandbox(attributes));
    });

    describe("when only attribute name is provided", function () {
      it("should pass if element has matching attribute", function () {
        expect($('sandbox')).toHaveAttr(attributeName);
      });

      it("should pass negated if element has no matching attribute", function () {
        expect($('sandbox')).not.toHaveAttr(wrongAttributeName);
      });
    });

    describe("when both attribute name and value are provided", function () {
      it("should pass if element has matching attribute with matching value", function () {
        expect($('sandbox')).toHaveAttr(attributeName, attributeValue);
      });

      it("should pass negated if element has matching attribute but with wrong value", function () {
        expect($('sandbox')).not.toHaveAttr(attributeName, wrongAttributeValue);
      });

      it("should pass negated if element has no matching attribute", function () {
        expect($('sandbox')).not.toHaveAttr(wrongAttributeName, attributeValue);
      });
    });
  });

  describe("toHaveId", function () {
    beforeEach(function () {
      setFixtures(sandbox());
    });

    it("should pass if id attribute matches expectation", function () {
      expect($('sandbox')).toHaveId('sandbox');
    });

    it("should pass negated if id attribute does not match expectation", function () {
      expect($('sandbox')).not.toHaveId('wrongId');
    });

    it("should pass negated if id attribute is not present", function () {
      expect($('<div />')).not.toHaveId('sandbox');
    });
  });

  describe("toHaveHtml", function () {
    var html = '<div>some text</div>'
      , wrongHtml = '<span>some text</span>'
      , element;

    beforeEach(function () {
      element = new Element('div').insert(html);
    });

    it("should pass when html matches", function () {
      expect(element).toHaveHtml(html);
    });

    it("should pass negated when html does not match", function () {
      expect(element).not.toHaveHtml(wrongHtml);
    });
  });

  describe("toHaveText", function () {
    var text = 'some text'
      , wrongText = 'some other text'
      , element;

    beforeEach(function () {
      element = new Element('div').insert(text);
    });

    it("should pass when text matches", function () {
      expect(element).toHaveText(text);
    });

    it("should pass negated when text does not match", function () {
      expect(element).not.toHaveText(wrongText);
    });

    it('should pass when text matches a regex', function () {
      expect(element).toHaveText(/some/);
    });

    it('should pass negated when text does not match a regex', function () {
      expect(element).not.toHaveText(/other/);
    });
  });

  describe("toHaveValue", function () {
    var value = 'some value'
      , differentValue = 'different value';

    beforeEach(function () {
      setFixtures(new Element('input', {id: 'sandbox', type: 'text', value: value}));
    });

    it("should pass if value matches expectation", function () {
      expect($('sandbox')).toHaveValue(value);
    });

    it("should pass negated if value does not match expectation", function () {
      expect($('sandbox')).not.toHaveValue(differentValue);
    });

    it("should pass negated if value attribute is not present", function () {
      expect(sandbox()).not.toHaveValue(value);
    });
  });

  //describe("toHaveData", function () {
  //  var key = 'some key'
  //    , value = 'some value'
  //    , wrongKey = 'wrong key'
  //    , wrongValue = 'wrong value';

  //  beforeEach(function () {
  //    setFixtures(sandbox().data(key, value));
  //  });

  //  describe("when only key is provided", function () {
  //    it("should pass if element has matching data key", function () {
  //      expect($('sandbox')).toHaveData(key);
  //    });

  //    it("should pass negated if element has no matching data key", function () {
  //      expect($('sandbox')).not.toHaveData(wrongKey);
  //    });
  //  });

  //  describe("when both key and value are provided", function () {
  //    it("should pass if element has matching key with matching value", function () {
  //      expect($('sandbox')).toHaveData(key, value);
  //    });

  //    it("should pass negated if element has matching key but with wrong value", function () {
  //      expect($('sandbox')).not.toHaveData(key, wrongValue);
  //    });

  //    it("should pass negated if element has no matching key", function () {
  //      expect($('sandbox')).not.toHaveData(wrongKey, value);
  //    });
  //  });
  //});

  describe("toBeVisible", function () {
    it("should pass on visible element", function () {
      setFixtures(sandbox());
      expect($('sandbox')).toBeVisible();
    });

    it("should pass negated on hidden element", function () {
      setFixtures(sandbox().hide());
      expect($('sandbox')).not.toBeVisible();
    });
  });

  describe("toBeHidden", function () {
    it("should pass on hidden element", function () {
      setFixtures(sandbox().hide());
      expect($('sandbox')).toBeHidden();
    });

    it("should pass negated on visible element", function () {
      setFixtures(sandbox());
      expect($('sandbox')).not.toBeHidden();
    });
  });

  describe("toBeSelected", function () {
    beforeEach(function () {
      setFixtures('\
        <select>\n\
          <option id="not-selected"></option>\n\
          <option id="selected" selected="selected"></option>\n\
        </select>');
    });

    it("should pass on selected element", function () {
      expect($('selected')).toBeSelected();
    });

    it("should pass negated on not selected element", function () {
      expect($('not-selected')).not.toBeSelected();
    });
  });

  describe("toBeChecked", function () {
    beforeEach(function () {
      setFixtures('\
        <input type="checkbox" id="checked" checked="checked" />\n\
        <input type="checkbox" id="not-checked" />');
    });

    it("should pass on checked element", function () {
      expect($('checked')).toBeChecked();
    });

    it("should pass negated on not checked element", function () {
      expect($('not-checked')).not.toBeChecked();
    });
  });

  describe("toBeEmpty", function () {
    it("should pass on empty element", function () {
      setFixtures(sandbox());
      expect($('sandbox')).toBeEmpty();
    });

    it("should pass negated on element with a tag inside", function () {
      setFixtures('<div id="sandbox"><span /></div>');
      expect($('sandbox')).not.toBeEmpty();
    });

    it("should pass negated on element with text inside", function () {
      setFixtures('<div id="sandbox">some text</div>');
      expect($('sandbox')).not.toBeEmpty();
    });
  });

  describe("toExist", function () {
    it("should pass on visible element", function () {
      setFixtures(sandbox());
      expect($('sandbox')).toExist();
    });

    it("should pass on hidden element", function () {
      setFixtures(sandbox().hide());
      expect($('sandbox')).toExist();
    });

    it("should pass negated if element is not present in DOM", function () {
      expect($('#non-existent-element')).not.toExist();
    });
  });

  //describe("toBe", function () {
  //  beforeEach(function () {
  //    setFixtures(sandbox());
  //  });

  //  it("should pass if object matches selector", function () {
  //    expect($('sandbox')).toBe('#sandbox');
  //  });

  //  it("should pass negated if object does not match selector", function () {
  //    expect($('#sandbox')).not.toBe('#wrong-id');
  //  });
  //});

  describe("toContain", function () {
    beforeEach(function () {
      setFixtures('<div id="sandbox"><span /></div>');
    });

    it("should pass if object contains selector", function () {
      expect($('sandbox')).toContain('span');
    });

    it("should pass negated if object does not contain selector", function () {
      expect($('sandbox')).not.toContain('div');
    });
  });

  describe("toBeDisabled", function () {
    beforeEach(function () {
      setFixtures('\
        <input type="text" disabled="disabled" id="disabled"/>\n\
        <input type="text" id="enabled"/>');
    });

    it("should pass on disabled element", function () {
      expect($('disabled')).toBeDisabled();
    });

    it("should pass negated on not selected element", function () {
      expect($('enabled')).not.toBeDisabled();
    });
  });

  describe('toHaveBeenTriggeredOn', function () {
    beforeEach(function () {
      setFixtures('<div id="sandbox"><a id="clickme" href="#">Click Me</a> <a id="otherlink">Other Link</a></div>');
      spyOnEvent($('clickme'), 'zemba:fleiba');
    });

    it('should pass if the event was triggered on the object', function () {
      $('clickme').fire('zemba:fleiba');
      expect('zemba:fleiba').toHaveBeenTriggeredOn($('clickme'));
    });

    it('should pass negated if the event was never triggered', function () {
      expect('zemba:fleiba').not.toHaveBeenTriggeredOn($('clickme'));
    });

    it('should pass negated if the event was triggered on another non-descendant object', function () {
      $('otherlink').fire('zemba:fleiba');
      expect('zemba:fleiba').not.toHaveBeenTriggeredOn($('clickme'));
    });
  });

  //describe('toHandle', function () {
  //  beforeEach(function () {
  //    setFixtures('<div id="sandbox"><a id="clickme" href="#">Click Me</a> <a id="otherlink">Other Link</a></div>');
  //  });

  //  it('should pass if the event is bound', function () {
  //    var handler = function () { }; // noop
  //    $('clickme').observe("zemba:fleiba", handler);
  //    expect($('clickme')).toHandle("zemba:fleiba");
  //  });

  //  it('should pass if the event is not bound', function () {
  //    expect($('clickme')).not.toHandle("zemba:fleiba");
  //  });

  //});

  //describe('toHandleWith', function () {
  //  beforeEach(function () {
  //    setFixtures('<div id="sandbox"><a id="clickme" href="#">Click Me</a> <a id="otherlink">Other Link</a></div>');
  //  });

  //  it('should pass if the event is bound with the given handler', function () {
  //    var handler = function () { }; // noop
  //    $('clickme').bind("zemba:fleiba", handler);
  //    expect($('clickme')).toHandleWith("zemba:fleiba", handler);
  //  });

  //  it('should pass if the event is not bound with the given handler', function () {
  //    var handler = function () { }
  //      , aDifferentHandler = function () { };
  //    $('clickme').bind("zemba:fleiba", handler);

  //    expect($('clickme')).not.toHandleWith("zemba:fleiba", aDifferentHandler);
  //  });

  //  it('should pass if the event is not bound at all', function () {
  //    expect($('clickme')).not.toHandle("zemba:fleiba");
  //  });

  //});
});
