import { ATTR_LOWER_CASE, TYPE_BOOLEAN, TYPE_NUMBER } from './constants';
import { ComponentMeta, ComponentRegistry, LoadComponentMeta,
  ComponentEventData, ComponentListenersData, ComponentMemberData, LoadComponentRegistry } from '../util/interfaces';
import { isDef, toDashCase } from './helpers';


export function parseComponentRegistry(cmpRegistryData: LoadComponentRegistry, registry: ComponentRegistry) {
  // tag name will always be upper case
  const cmpMeta: ComponentMeta = {
    tagNameMeta: cmpRegistryData[0],
    membersMeta: {
      // every component defaults to always have
      // the mode and color properties
      // but only observe the color attribute
      // mode cannot change after the component was created
      'mode': {},
      'color': { attribName: 'color' }
    }
  };

  cmpMeta.moduleId = cmpRegistryData[1];

  // map of the modes w/ bundle id and style data
  cmpMeta.styleIds = cmpRegistryData[2] || {};

  // parse member meta
  parseMembersData(cmpMeta, cmpRegistryData[3]);

  if (cmpRegistryData[4]) {
    // parse listener meta
    cmpMeta.listenersMeta = cmpRegistryData[4].map(parseListenerData);
  }

  // slot
  cmpMeta.slotMeta = cmpRegistryData[5];

  // bundle load priority
  cmpMeta.loadPriority = cmpRegistryData[6];

  return registry[cmpMeta.tagNameMeta] = cmpMeta;
}


function parseListenerData(listenerData: ComponentListenersData) {
  return {
    eventName: listenerData[0],
    eventMethodName: listenerData[1],
    eventDisabled: !!listenerData[2],
    eventPassive: !!listenerData[3],
    eventCapture: !!listenerData[4]
  };
}


function parseMembersData(cmpMeta: ComponentMeta, memberData: ComponentMemberData[]) {
  if (memberData) {
    for (var i = 0; i < memberData.length; i++) {
      var d = memberData[i];
      cmpMeta.membersMeta[d[0]] = {
        memberType: d[1],
        attribName: (d[2] === ATTR_LOWER_CASE ? d[0].toLowerCase() : toDashCase(d[0])),
        propType: d[3],
        ctrlTag: d[4]
      };
    }
  }
}


export function parseComponentMeta(registry: ComponentRegistry, moduleImports: any, cmpMetaData: LoadComponentMeta) {
  // tag name will always be upper case
  const cmpMeta = registry[cmpMetaData[0]];

  // get the component class which was added to moduleImports
  // using the tag as the key on the export object
  cmpMeta.componentModule = moduleImports[cmpMetaData[0]];

  // component members
  parseMembersData(cmpMeta, cmpMetaData[1]);

  // host element meta
  cmpMeta.hostMeta = cmpMetaData[2];

  // component instance events
  if (cmpMetaData[3]) {
    cmpMeta.eventsMeta = cmpMetaData[3].map(parseEventData);
  }

  // component instance prop WILL change methods
  cmpMeta.propsWillChangeMeta = cmpMetaData[4];

  // component instance prop DID change methods
  cmpMeta.propsDidChangeMeta = cmpMetaData[5];

  // is shadow
  cmpMeta.isShadowMeta = !!cmpMetaData[6];
}


function parseEventData(d: ComponentEventData) {
  return {
    eventName: d[0],
    eventMethodName: d[1],
    eventBubbles: !!d[2],
    eventCancelable: !!d[3],
    eventComposed: !!d[4],
  };
}


export function parsePropertyValue(propType: number, propValue: any) {
  // ensure this value is of the correct prop type
  if (isDef(propValue)) {
    if (propType === TYPE_BOOLEAN) {
      // per the HTML spec, any string value means it is a boolean "true" value
      // but we'll cheat here and say that the string "false" is the boolean false
      return (propValue === 'false' ? false :  propValue === '' || !!propValue);
    }

    if (propType === TYPE_NUMBER) {
      // force it to be a number
      return parseFloat(propValue);
    }
  }

  // not sure exactly what type we want
  // so no need to change to a different type
  return propValue;
}
