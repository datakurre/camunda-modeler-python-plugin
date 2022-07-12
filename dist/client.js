(function () {
  'use strict';

  /**
   * Validate and register a client plugin.
   *
   * @param {Object} plugin
   * @param {String} type
   */
  function registerClientPlugin(plugin, type) {
    var plugins = window.plugins || [];
    window.plugins = plugins;

    if (!plugin) {
      throw new Error('plugin not specified');
    }

    if (!type) {
      throw new Error('type not specified');
    }

    plugins.push({
      plugin: plugin,
      type: type
    });
  }
  /**
   * Validate and register a bpmn-js plugin.
   *
   * @param {Object} module
   *
   * @example
   *
   * import {
   *   registerBpmnJSPlugin
   * } from 'camunda-modeler-plugin-helpers';
   *
   * const BpmnJSModule = {
   *   __init__: [ 'myService' ],
   *   myService: [ 'type', ... ]
   * };
   *
   * registerBpmnJSPlugin(BpmnJSModule);
   */

  function registerBpmnJSPlugin(module) {
    registerClientPlugin(module, 'bpmn.modeler.additionalModules');
  }

  function createCommonjsModule(fn) {
    var module = { exports: {} };
  	return fn(module, module.exports), module.exports;
  }

  var inherits_browser = createCommonjsModule(function (module) {
  if (typeof Object.create === 'function') {
    // implementation from standard node.js 'util' module
    module.exports = function inherits(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
      }
    };
  } else {
    // old school shim for old browsers
    module.exports = function inherits(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;

        var TempCtor = function TempCtor() {};

        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor();
        ctor.prototype.constructor = ctor;
      }
    };
  }
  });

  /**
   * Is an element of the given BPMN type?
   *
   * @param  {djs.model.Base|ModdleElement} element
   * @param  {string} type
   *
   * @return {boolean}
   */
  function is(element, type) {
    var bo = getBusinessObject(element);
    return bo && typeof bo.$instanceOf === 'function' && bo.$instanceOf(type);
  }
  /**
   * Return the business object for a given element.
   *
   * @param  {djs.model.Base|ModdleElement} element
   *
   * @return {ModdleElement}
   */

  function getBusinessObject(element) {
    return element && element.businessObject || element;
  }

  function ensureImported(element, target) {
    if (element.ownerDocument !== target.ownerDocument) {
      try {
        // may fail on webkit
        return target.ownerDocument.importNode(element, true);
      } catch (e) {// ignore
      }
    }

    return element;
  }
  /**
   * appendTo utility
   */

  /**
   * Append a node to a target element and return the appended node.
   *
   * @param  {SVGElement} element
   * @param  {SVGElement} target
   *
   * @return {SVGElement} the appended node
   */


  function appendTo(element, target) {
    return target.appendChild(ensureImported(element, target));
  }
  /**
   * append utility
   */

  /**
   * Append a node to an element
   *
   * @param  {SVGElement} element
   * @param  {SVGElement} node
   *
   * @return {SVGElement} the element
   */


  function append(target, node) {
    appendTo(node, target);
    return target;
  }
  /**
   * attribute accessor utility
   */


  var LENGTH_ATTR = 2;
  var CSS_PROPERTIES = {
    'alignment-baseline': 1,
    'baseline-shift': 1,
    'clip': 1,
    'clip-path': 1,
    'clip-rule': 1,
    'color': 1,
    'color-interpolation': 1,
    'color-interpolation-filters': 1,
    'color-profile': 1,
    'color-rendering': 1,
    'cursor': 1,
    'direction': 1,
    'display': 1,
    'dominant-baseline': 1,
    'enable-background': 1,
    'fill': 1,
    'fill-opacity': 1,
    'fill-rule': 1,
    'filter': 1,
    'flood-color': 1,
    'flood-opacity': 1,
    'font': 1,
    'font-family': 1,
    'font-size': LENGTH_ATTR,
    'font-size-adjust': 1,
    'font-stretch': 1,
    'font-style': 1,
    'font-variant': 1,
    'font-weight': 1,
    'glyph-orientation-horizontal': 1,
    'glyph-orientation-vertical': 1,
    'image-rendering': 1,
    'kerning': 1,
    'letter-spacing': 1,
    'lighting-color': 1,
    'marker': 1,
    'marker-end': 1,
    'marker-mid': 1,
    'marker-start': 1,
    'mask': 1,
    'opacity': 1,
    'overflow': 1,
    'pointer-events': 1,
    'shape-rendering': 1,
    'stop-color': 1,
    'stop-opacity': 1,
    'stroke': 1,
    'stroke-dasharray': 1,
    'stroke-dashoffset': 1,
    'stroke-linecap': 1,
    'stroke-linejoin': 1,
    'stroke-miterlimit': 1,
    'stroke-opacity': 1,
    'stroke-width': LENGTH_ATTR,
    'text-anchor': 1,
    'text-decoration': 1,
    'text-rendering': 1,
    'unicode-bidi': 1,
    'visibility': 1,
    'word-spacing': 1,
    'writing-mode': 1
  };

  function getAttribute(node, name) {
    if (CSS_PROPERTIES[name]) {
      return node.style[name];
    } else {
      return node.getAttributeNS(null, name);
    }
  }

  function setAttribute(node, name, value) {
    var hyphenated = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    var type = CSS_PROPERTIES[hyphenated];

    if (type) {
      // append pixel unit, unless present
      if (type === LENGTH_ATTR && typeof value === 'number') {
        value = String(value) + 'px';
      }

      node.style[hyphenated] = value;
    } else {
      node.setAttributeNS(null, name, value);
    }
  }

  function setAttributes(node, attrs) {
    var names = Object.keys(attrs),
        i,
        name;

    for (i = 0, name; name = names[i]; i++) {
      setAttribute(node, name, attrs[name]);
    }
  }
  /**
   * Gets or sets raw attributes on a node.
   *
   * @param  {SVGElement} node
   * @param  {Object} [attrs]
   * @param  {String} [name]
   * @param  {String} [value]
   *
   * @return {String}
   */


  function attr(node, name, value) {
    if (typeof name === 'string') {
      if (value !== undefined) {
        setAttribute(node, name, value);
      } else {
        return getAttribute(node, name);
      }
    } else {
      setAttributes(node, name);
    }

    return node;
  }

  var ns = {
    svg: 'http://www.w3.org/2000/svg'
  };
  /**
   * DOM parsing utility
   */

  var SVG_START = '<svg xmlns="' + ns.svg + '"';

  function parse(svg) {
    var unwrap = false; // ensure we import a valid svg document

    if (svg.substring(0, 4) === '<svg') {
      if (svg.indexOf(ns.svg) === -1) {
        svg = SVG_START + svg.substring(4);
      }
    } else {
      // namespace svg
      svg = SVG_START + '>' + svg + '</svg>';
      unwrap = true;
    }

    var parsed = parseDocument(svg);

    if (!unwrap) {
      return parsed;
    }

    var fragment = document.createDocumentFragment();
    var parent = parsed.firstChild;

    while (parent.firstChild) {
      fragment.appendChild(parent.firstChild);
    }

    return fragment;
  }

  function parseDocument(svg) {
    var parser; // parse

    parser = new DOMParser();
    parser.async = false;
    return parser.parseFromString(svg, 'text/xml');
  }
  /**
   * Create utility for SVG elements
   */

  /**
   * Create a specific type from name or SVG markup.
   *
   * @param {String} name the name or markup of the element
   * @param {Object} [attrs] attributes to set on the element
   *
   * @returns {SVGElement}
   */


  function create(name, attrs) {
    var element;

    if (name.charAt(0) === '<') {
      element = parse(name).firstChild;
      element = document.importNode(element, true);
    } else {
      element = document.createElementNS(ns.svg, name);
    }

    if (attrs) {
      attr(element, attrs);
    }

    return element;
  }
  /**
   * Geometry helpers
   */
  // fake node used to instantiate svg geometry elements


  var node = create('svg');

  var img = "data:image/svg+xml,%3c%3fxml version='1.0' encoding='UTF-8' standalone='no'%3f%3e%3c!-- Created with Inkscape (http://www.inkscape.org/) --%3e%3csvg xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:cc='http://web.resource.org/cc/' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns%23' xmlns:svg='http://www.w3.org/2000/svg' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:sodipodi='http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd' xmlns:inkscape='http://www.inkscape.org/namespaces/inkscape' width='110.4211' height='109.8461' id='svg2169' sodipodi:version='0.32' inkscape:version='0.45.1' version='1.0' sodipodi:docbase='/home/bene/Desktop' sodipodi:docname='dessin-1.svg' inkscape:output_extension='org.inkscape.output.svg.inkscape'%3e %3cdefs id='defs2171'%3e %3clinearGradient id='linearGradient11301' inkscape:collect='always'%3e %3cstop id='stop11303' offset='0' style='stop-color:%23ffe052%3bstop-opacity:1' /%3e %3cstop id='stop11305' offset='1' style='stop-color:%23ffc331%3bstop-opacity:1' /%3e %3c/linearGradient%3e %3clinearGradient gradientUnits='userSpaceOnUse' y2='168.1012' x2='147.77737' y1='111.92053' x1='89.136749' id='linearGradient11307' xlink:href='%23linearGradient11301' inkscape:collect='always' /%3e %3clinearGradient id='linearGradient9515' inkscape:collect='always'%3e %3cstop id='stop9517' offset='0' style='stop-color:%23387eb8%3bstop-opacity:1' /%3e %3cstop id='stop9519' offset='1' style='stop-color:%23366994%3bstop-opacity:1' /%3e %3c/linearGradient%3e %3clinearGradient gradientUnits='userSpaceOnUse' y2='131.85291' x2='110.14919' y1='77.070274' x1='55.549179' id='linearGradient9521' xlink:href='%23linearGradient9515' inkscape:collect='always' /%3e %3c/defs%3e %3csodipodi:namedview id='base' pagecolor='white' bordercolor='%23666666' borderopacity='1.0' inkscape:pageopacity='0.0' inkscape:pageshadow='2' inkscape:zoom='0.24748737' inkscape:cx='-260.46312' inkscape:cy='316.02744' inkscape:document-units='px' inkscape:current-layer='layer1' width='131.10236px' height='184.25197px' inkscape:window-width='872' inkscape:window-height='624' inkscape:window-x='5' inkscape:window-y='48' /%3e %3cmetadata id='metadata2174'%3e %3crdf:RDF%3e %3ccc:Work rdf:about=''%3e %3cdc:format%3eimage/svg%2bxml%3c/dc:format%3e %3cdc:type rdf:resource='http://purl.org/dc/dcmitype/StillImage' /%3e %3c/cc:Work%3e %3c/rdf:RDF%3e %3c/metadata%3e %3cg inkscape:label='Calque 1' inkscape:groupmode='layer' id='layer1' transform='translate(-473.36088%2c-251.72485)'%3e %3cg id='g1894' transform='translate(428.42338%2c184.2561)'%3e %3cpath style='opacity:1%3bcolor:black%3bfill:url(%23linearGradient9521)%3bfill-opacity:1%3bfill-rule:nonzero%3bstroke:none%3bstroke-width:1%3bstroke-linecap:butt%3bstroke-linejoin:miter%3bmarker:none%3bmarker-start:none%3bmarker-mid:none%3bmarker-end:none%3bstroke-miterlimit:4%3bstroke-dasharray:none%3bstroke-dashoffset:0%3bstroke-opacity:1%3bvisibility:visible%3bdisplay:inline%3boverflow:visible' d='M 99.75%2c67.46875 C 71.718268%2c67.468752 73.46875%2c79.625 73.46875%2c79.625 L 73.5%2c92.21875 L 100.25%2c92.21875 L 100.25%2c96 L 62.875%2c96 C 62.875%2c96 44.9375%2c93.965724 44.9375%2c122.25 C 44.937498%2c150.53427 60.59375%2c149.53125 60.59375%2c149.53125 L 69.9375%2c149.53125 L 69.9375%2c136.40625 C 69.9375%2c136.40625 69.433848%2c120.75 85.34375%2c120.75 C 101.25365%2c120.75 111.875%2c120.75 111.875%2c120.75 C 111.875%2c120.75 126.78125%2c120.99096 126.78125%2c106.34375 C 126.78125%2c91.696544 126.78125%2c82.125 126.78125%2c82.125 C 126.78125%2c82.124998 129.04443%2c67.46875 99.75%2c67.46875 z M 85%2c75.9375 C 87.661429%2c75.937498 89.8125%2c78.088571 89.8125%2c80.75 C 89.812502%2c83.411429 87.661429%2c85.5625 85%2c85.5625 C 82.338571%2c85.562502 80.1875%2c83.411429 80.1875%2c80.75 C 80.187498%2c78.088571 82.338571%2c75.9375 85%2c75.9375 z ' id='path8615' /%3e %3cpath id='path8620' d='M 100.5461%2c177.31485 C 128.57784%2c177.31485 126.82735%2c165.1586 126.82735%2c165.1586 L 126.7961%2c152.56485 L 100.0461%2c152.56485 L 100.0461%2c148.7836 L 137.4211%2c148.7836 C 137.4211%2c148.7836 155.3586%2c150.81787 155.3586%2c122.53359 C 155.35861%2c94.249323 139.70235%2c95.252343 139.70235%2c95.252343 L 130.3586%2c95.252343 L 130.3586%2c108.37734 C 130.3586%2c108.37734 130.86226%2c124.03359 114.95235%2c124.03359 C 99.042448%2c124.03359 88.421098%2c124.03359 88.421098%2c124.03359 C 88.421098%2c124.03359 73.514848%2c123.79263 73.514848%2c138.43985 C 73.514848%2c153.08705 73.514848%2c162.6586 73.514848%2c162.6586 C 73.514848%2c162.6586 71.251668%2c177.31485 100.5461%2c177.31485 z M 115.2961%2c168.8461 C 112.63467%2c168.8461 110.4836%2c166.69503 110.4836%2c164.0336 C 110.4836%2c161.37217 112.63467%2c159.2211 115.2961%2c159.2211 C 117.95753%2c159.2211 120.1086%2c161.37217 120.1086%2c164.0336 C 120.10861%2c166.69503 117.95753%2c168.8461 115.2961%2c168.8461 z ' style='opacity:1%3bcolor:black%3bfill:url(%23linearGradient11307)%3bfill-opacity:1%3bfill-rule:nonzero%3bstroke:none%3bstroke-width:1%3bstroke-linecap:butt%3bstroke-linejoin:miter%3bmarker:none%3bmarker-start:none%3bmarker-mid:none%3bmarker-end:none%3bstroke-miterlimit:4%3bstroke-dasharray:none%3bstroke-dashoffset:0%3bstroke-opacity:1%3bvisibility:visible%3bdisplay:inline%3boverflow:visible' /%3e %3c/g%3e %3c/g%3e%3c/svg%3e";

  var DEFAULT_RENDER_PRIORITY = 1000;
  /**
   * The base implementation of shape and connection renderers.
   *
   * @param {EventBus} eventBus
   * @param {number} [renderPriority=1000]
   */

  function BaseRenderer(eventBus, renderPriority) {
    var self = this;
    renderPriority = renderPriority || DEFAULT_RENDER_PRIORITY;
    eventBus.on(['render.shape', 'render.connection'], renderPriority, function (evt, context) {
      var type = evt.type,
          element = context.element,
          visuals = context.gfx;

      if (self.canRender(element)) {
        if (type === 'render.shape') {
          return self.drawShape(visuals, element);
        } else {
          return self.drawConnection(visuals, element);
        }
      }
    });
    eventBus.on(['render.getShapePath', 'render.getConnectionPath'], renderPriority, function (evt, element) {
      if (self.canRender(element)) {
        if (evt.type === 'render.getShapePath') {
          return self.getShapePath(element);
        } else {
          return self.getConnectionPath(element);
        }
      }
    });
  }
  /**
   * Should check whether *this* renderer can render
   * the element/connection.
   *
   * @param {element} element
   *
   * @returns {boolean}
   */

  BaseRenderer.prototype.canRender = function () {};
  /**
   * Provides the shape's snap svg element to be drawn on the `canvas`.
   *
   * @param {djs.Graphics} visuals
   * @param {Shape} shape
   *
   * @returns {Snap.svg} [returns a Snap.svg paper element ]
   */


  BaseRenderer.prototype.drawShape = function () {};
  /**
   * Provides the shape's snap svg element to be drawn on the `canvas`.
   *
   * @param {djs.Graphics} visuals
   * @param {Connection} connection
   *
   * @returns {Snap.svg} [returns a Snap.svg paper element ]
   */


  BaseRenderer.prototype.drawConnection = function () {};
  /**
   * Gets the SVG path of a shape that represents it's visual bounds.
   *
   * @param {Shape} shape
   *
   * @return {string} svg path
   */


  BaseRenderer.prototype.getShapePath = function () {};
  /**
   * Gets the SVG path of a connection that represents it's visual bounds.
   *
   * @param {Connection} connection
   *
   * @return {string} svg path
   */


  BaseRenderer.prototype.getConnectionPath = function () {};

  function PythonRenderer(eventBus, bpmnRenderer) {
    BaseRenderer.call(this, eventBus, 1500);

    this.canRender = function (element) {
      return is(element, 'bpmn:ScriptTask') && element.businessObject.scriptFormat.match(/python|jython/i);
    };

    this.drawShape = function (parent, element) {
      var shape = bpmnRenderer.handlers["bpmn:Task"](parent, element);
      var gfx = create('image', {
        x: 5,
        y: 5,
        width: 20,
        // element.width,
        height: 20,
        //  element.height,
        href: img
      });
      append(parent, gfx);
      return gfx;
    };
  }
  inherits_browser(PythonRenderer, BaseRenderer);
  PythonRenderer.$inject = ['eventBus', 'bpmnRenderer'];

  var BpmnExtensionModule = {
    __init__: ['PythonScriptTask'],
    PythonScriptTask: ['type', PythonRenderer]
  };

  registerBpmnJSPlugin(BpmnExtensionModule);

}());
