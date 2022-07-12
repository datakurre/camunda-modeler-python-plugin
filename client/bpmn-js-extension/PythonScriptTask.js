import inherits from 'inherits/inherits_browser';
import {
  is,
} from 'bpmn-js/lib/util/ModelUtil';

import {
  append as svgAppend,
  create as svgCreate
} from 'tiny-svg';

import Python from './python.svg';

import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

export default function PythonRenderer(eventBus, bpmnRenderer) {
  BaseRenderer.call(this, eventBus, 1500);
  this.canRender = function(element) {
    return is(element, 'bpmn:ScriptTask') && element.businessObject.scriptFormat.match(/python|jython/i);
  };
  this.drawShape = function(parent, element) {
    const shape = bpmnRenderer.handlers["bpmn:Task"](parent, element);
    var gfx = svgCreate('image', {
      x: 5,
      y: 5,
      width: 20, // element.width,
      height: 20, //  element.height,
      href:Python 
    });

    svgAppend(parent, gfx);

    return gfx;
  };
}

inherits(PythonRenderer, BaseRenderer);

PythonRenderer.$inject = [ 'eventBus', 'bpmnRenderer' ];
