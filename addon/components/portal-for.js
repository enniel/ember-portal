import Component from 'ember-component';
import service from 'ember-service/inject';
import portalIdForName from '../utils/portal-id';

export default Component.extend({
  portalService: service("portal"),

  name: 'default',

  'portal-class': null,

  portalElement() {
    const elementID = portalIdForName(this.get("name"));
    let element = document.getElementById(elementID);

    if (!element) {
      element = document.createElement('div');
      element.id = elementID;
    }

    return element;
  },

  didInsertElement() {
    this._super(...arguments);

    const portal = this.portalElement();
    portal.style.display = null;

    const portalClass = this.get("portal-class");
    if (portalClass && !portal.className) {
      portal.className = portalClass;
    }

    this.get("element").appendChild(portal);
    this.get("portalService").setPortalComponent(this.get("name"), this);
  },

  willDestroyElement() {
    this._super(...arguments);
    const portal = this.portalElement();
    portal.style.display = 'none';
    document.body.appendChild(portal);
    this.get("portalService").setPortalComponent(this.get("name"), null);
  }

});
