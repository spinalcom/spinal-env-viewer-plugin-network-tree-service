
import "spinal-env-viewer-plugin-forge";

import { bimObjectManagerService } from "spinal-env-viewer-bim-manager-service";
import { SpinalGraphService, SPINAL_RELATION_PTR_LST_TYPE } from "spinal-env-viewer-graph-service";
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { NETWORK_BIMOJECT_RELATION, NETWORK_TYPE, OBJECT_ATTR, PLC_ATTR, ATTRIBUTE_CATEGORY, NETWORK_RELATION } from "../data/constants";
import { NetworkTreeService } from "./NetworkTreeService";

import * as _ from 'lodash';
import Utilities from "../utilities/utilities";
import { INodeInfoOBJ } from "../data/Interfaces";


// const spinalForgeViewer = new SpinalForgeViewer();
const g_win: any = typeof window === "undefined" ? global : window;
const bimObjectService = g_win.spinal.BimObjectService;

export default class GenerateNetworkTreeService {


   public static async getElementProperties(items: { model: any; selection: Number[] } | Array<{ model: any; selection: Number[] }>, attributeName: string, namingConventionConfig: {
      attributeName: string, useAttrValue: boolean, personalized: { callback: Function }
   }): Promise<{ validItems: Array<any>; invalidItems: Array<any> }> {

      const promises = [];

      const data = await bimObjectManagerService.getBimObjectProperties(items);

      for (const item of data) {
         promises.push(this._getItemPropertiesFormatted(item.model, item.properties, attributeName, namingConventionConfig));
      }

      return Promise.all(promises).then((result) => {
         const resultFlatted = Utilities._flatten(result);

         const res = {
            validItems: [],
            invalidItems: []
         }

         for (const el of resultFlatted) {
            if (el.property) {
               res.validItems.push(el);
            } else {
               res.invalidItems.push(el);
            }
         }

         return res;
      })
   }

   public static async createTree(automates, equipments, config): Promise<{ tree: Array<any>; invalids: Array<any>; valids: Array<any>; }> {
      return this._getTreeArray(automates, equipments, config).then(async ({ tree, valids, invalids }) => {
         const treeL = await this._TransformArrayToTree(tree);
         return {
            tree: treeL,
            invalids,
            valids
         }

      })

   }

   public static createTreeNodes(contextId: string, nodeId: string, tree: Array<{ children: Array<INodeInfoOBJ> }>, dontCreateEmptyAutomate: boolean = true): Promise<any> {
      if (dontCreateEmptyAutomate) {
         tree = tree.filter(el => el.children.length > 0);
      }
      const promises = tree.map(el => this._createNodes(contextId, el, nodeId));
      return Promise.all(promises);

   }

   public static classifyDbIdsByModel(items: Array<{ model: any, dbId: number }>): Array<{ model: any, ids: Array<number> }> {
      const res = [];
      for (const { dbId, model } of items) {
         const found = res.find(el => el.model.id === model.id);
         if (found) found.ids.push(dbId);
         else res.push({ model, ids: [dbId] });
      }

      return res;
   }

   ////////////////////////////////////////////////////////////////////////////////
   ////                                PRIVATES                                  //
   ////////////////////////////////////////////////////////////////////////////////

   private static _getItemPropertiesFormatted(model: any, itemList: Array<any>, attributeName: string, namingConventionConfig: {}) {
      const promises = itemList.map(async el => {
         el.model = model;
         el.property = this._getAttributeByName(el.properties, attributeName);
         if (namingConventionConfig) {
            el.namingConvention = await this._getNamingConvention(el, namingConventionConfig);
         }

         return el;
      })

      return Promise.all(promises)
   }

   private static _getBimObjectName({ dbId, model }) {
      return new Promise((resolve, reject) => {
         model.getBulkProperties([dbId], {
            propFilter: ['name']
         }, (el) => {
            resolve(el);
         })
      });
   }

   private static _getAttributeByName(properties, propertyName) {
      return properties.find((obj) => {
         return (obj.displayName === propertyName || obj.attributeName === propertyName) && (obj.displayValue && ((obj.displayValue + '').length > 0))
      });
   }

   private static async _getTreeArray(items, equipments, config) {

      const tree = await this._formatAutomateAttribute(items);
      const invalids = [];
      const valids = [];
      const subList = _.chunk(equipments, 100);

      const promises = subList.map(el => {
         return this._formatEquipmentAttribute(tree, el, config)
      })

      return Promise.all(_.flattenDeep(promises)).then((result) => {
         for (const ite of result) {
            if ((<any>ite).parentId !== "noParent") {
               tree.push(ite);
               valids.push(ite);
            } else {
               invalids.push(ite);
            }
         }

         return {
            tree: tree,
            valids: valids,
            invalids: invalids
         }
      })
   }

   private static _formatAutomateAttribute(items) {
      const promises = items.map(el => {
         return this._getBimObjectName(el).then((result) => {
            el.id = result[0].dbId;
            el.name = result[0].name;

            el.property = el.property.displayValue;
            el.isAutomate = true;
            el.color = this._generateRandomColor();
            return el;
         })
      })

      return Promise.all(promises);
   }

   private static _formatEquipmentAttribute(tree, equipments, config) {

      const promises = [];

      for (const element of equipments) {
         promises.push(this._formatItem(tree, element, config));

         // const attributes = element.property.displayValue.split(separator);
         // const len = attributes.length;

         // const attr = element.property.displayValue.split(separator, indice).join(separator)
         // const attr = element.property.displayValue;

         // const parent = this.getElementAut(tree, element, config);

      }

      return promises;

   }

   private static async _formatItem(tree, element, config) {
      const obj = {
         model: element.model,
         namingConvention: element.namingConvention,
         dbId: element.dbId,
         externalId: element.externalId,
         id: element.dbId,
         children: [],
         parentId: "noParent"
      }

      let parent = this.getElementAut(tree, element, config);

      if (parent && parent.dbId !== obj.dbId) {
         // console.log("parent found", parent.name);
         obj.parentId = parent.id;
      }

      return obj;
   }

   private static async _createBimObjectNode({ dbId, model, color, isAutomate }) {

      const elements = await this._getBimObjectName({ dbId, model })
      const element = elements[0];

      return bimObjectService.createBIMObject(element.dbId, element.name, model).then((node) => {
         const nodeId = node.id ? node.id.get() : node.info.id.get();
         const realNode = SpinalGraphService.getRealNode(nodeId);

         if (realNode.info.color) {
            realNode.info.color.set(color);
         } else {
            realNode.info.add_attr({ color: color });
         }

         if (realNode.info.isAutomate) {
            realNode.info.isAutomate.set(isAutomate);
         } else {
            realNode.info.add_attr({ isAutomate: isAutomate });
         }

         return nodeId;
      })
   }

   private static async _createNodes(contextId, node, parentId) {
      let id;
      let relationName;

      if (node.externalId && node.dbId) {
         id = await this._createBimObjectNode(node);
         relationName = NETWORK_BIMOJECT_RELATION
      } else {
         id = SpinalGraphService.createNode({
            name: node.name,
            type: NETWORK_TYPE,
            color: node.color,
            isAutomate: node.isAutomate
         }, new spinal.Model());
         relationName = NETWORK_RELATION
      }

      return this._addSpinalAttribute(id, node.namingConvention).then(async (result) => {
         await SpinalGraphService.addChildInContext(parentId, id, contextId, relationName, SPINAL_RELATION_PTR_LST_TYPE);

         if (node.children && node.children.length > 0) {
            return Promise.all(node.children.map(el => this._createNodes(contextId, el, id)))
         }

         return []
      })



   }

   private static _TransformArrayToTree(items) {

      const rootItems = [];

      const lookup = {};

      for (const item of items) {

         const itemId = item["id"];
         const parentId = item["parentId"];

         if (!lookup[itemId]) lookup[itemId] = { ["children"]: [] }

         lookup[itemId] = Object.assign({}, item, { ["children"]: lookup[itemId]["children"] })

         const TreeItem = lookup[itemId];

         if (parentId === null || parentId === undefined || parentId === "") {

            rootItems.push(TreeItem);
         }

         else {
            if (!lookup[parentId]) lookup[parentId] = { ["children"]: [] };
            lookup[parentId]["children"].push(TreeItem);
         }
      }

      return rootItems
   }

   private static _generateRandomColor() {
      const randomColor = Math.floor(Math.random() * 16777215).toString(16);
      return '#' + randomColor;
   }

   private static getElementAut(tree, item, config) {
      const elementAttribute = item.property.displayValue;

      if (config.isRegex) {

         const flags = config.flags.join('');

         return eval(`tree.find(element => {
            const select = config.select.replace('${OBJECT_ATTR}', elementAttribute).replace('${PLC_ATTR}', element.property);
            const text = config.text.replace('${OBJECT_ATTR}', elementAttribute).replace('${PLC_ATTR}', element.property);
            const regex = new RegExp(text,flags)
            const res = (select + "").match(regex);
            
            return res ? true : false;
         })`)

      } else {

         return eval(
            `tree.find(element => {
               return (${config.callback})(element.property, elementAttribute); 
            })`
         )
      }
   }

   private static async _getNamingConvention(node, namingConventionConfig) {
      const property = await this._getpropertyValue(node, namingConventionConfig.attributeName);

      if (property && ((property.displayValue + '').length > 0)) {
         const value = property.displayValue;

         return namingConventionConfig.useAttrValue ? value : eval(`(${namingConventionConfig.personalized.callback})('${value}')`)
      }

   }

   private static async _getpropertyValue(node, attributeName) {
      let properties = node.properties;
      if (typeof properties === "undefined") {
         const res = await bimObjectManagerService.getBimObjectProperties([{ model: node.model, selection: [node.dbId] }]);
         properties = res[0].properties;
      }

      return this._getAttributeByName(properties, attributeName);
   }

   private static _addSpinalAttribute(id, namingConvention) {
      if (!namingConvention || namingConvention.length === 0) return;
      const realNode = SpinalGraphService.getRealNode(id);
      if (!realNode) return;

      return serviceDocumentation.addCategoryAttribute(realNode, ATTRIBUTE_CATEGORY).then((attributeCategory) => {
         return serviceDocumentation.addAttributeByCategory(realNode, attributeCategory, "namingConvention", namingConvention);
      })
   }
}

export {
   GenerateNetworkTreeService
}