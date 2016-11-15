// HAX: Temporarily monkeypatching some helper methods in fulcrum-core here.

const fulcrumCore = require('fulcrum-core');

fulcrumCore.Form.prototype.rootLevelElements = function () {
  function getElements(parent) {
    let elements = [];

    parent.elements.forEach(function (element) {
      if (element.isRepeatableElement) {
        return;
      }

      if (element.isSectionElement) {
        elements = elements.concat(getElements(element));
      } else {
        elements.push(element);
      }
    });

    return elements;
  }

  return getElements(this);
}

fulcrumCore.Record.prototype.toGeoJSONFeature = function () {
  const properties = {};
  const rootLevelElements = this.form.rootLevelElements();

  rootLevelElements.forEach(function (element) {
    const value = this.formValues.find(element.dataName);

    if (value) {
      properties[element.dataName] = value.displayValue;
    }
  }.bind(this));

  return {
    id: this.id,
    type: 'Feature',
    geometry: this.geometryAsGeoJSON,
    properties: properties
  };
};

module.exports = fulcrumCore;
