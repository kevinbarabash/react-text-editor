var expect = require('expect.js');
var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var NodeEditor = require('../src/NodeEditor');
var prog = require('../src/prog');
var jsdom = require('jsdom');


if (typeof document === 'undefined') {
    global.document = jsdom.jsdom("<html><body></body></html>");
    global.window = document.defaultView;
    global.navigator = window.navigator;
}

describe('NodeEditor', function() {
    it('should do something', function() {
        var shallowRenderer = TestUtils.createRenderer();
        var editor = <NodeEditor node={prog} />;
        shallowRenderer.render(editor);
    });
});


