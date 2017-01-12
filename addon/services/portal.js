import Service from 'ember-service';
import { scheduleOnce } from 'ember-runloop';
import Ember from 'ember';

const ADDED_QUEUE = Ember.A();
const REMOVED_QUEUE = Ember.A();

export default Service.extend({
  portals: null,

  init() {
    this._super(...arguments);
    this.set("portals", {});
  },

  portalFor(name) {
    const portals = this.get("portals");
    let portal = portals[name], items = portal && portal["items"];
    if (!portal) {
      items = Ember.A();
      portal = {
        items, component: null
      };
      portals[name] = portal;
    }
    return portal;
  },

  itemsFor(name) {
    return this.portalFor(name)["items"];
  },

  setPortalComponent(name, component) {
    this.portalFor(name)["component"] = component;
  },

  addPortalContent(name, component) {
    if (this.addToQueueInReverse()) {
      ADDED_QUEUE.unshift({ name, component });
    } else {
      ADDED_QUEUE.push({ name, component });
    }

    scheduleOnce("afterRender", this, this.flushPortalContent);
  },

  // run after render to avoid warning that items were modified on didInsertElement hook
  flushPortalContent() {
    ADDED_QUEUE.forEach(({name, component}) => {
      this.itemsFor(name).pushObject(component);
    });
    ADDED_QUEUE.clear();

    REMOVED_QUEUE.forEach(({name, component}) => {
      this.itemsFor(name).removeObject(component);
    });
    REMOVED_QUEUE.clear();
  },

  removePortalContent(name, component) {
    REMOVED_QUEUE.push({name, component});
    scheduleOnce("afterRender", this, this.flushPortalContent);
  },

  // prior to 1.13.x components are inserted in reverse order
  addToQueueInReverse() {
    const [maj, min] = Ember.VERSION.split('.').map(i => parseInt(i, null));
    return maj === 1 && min < 13;
  }
});
