/*
 * Copyright 2021 SpinalCom - www.spinalcom.com
 * 
 * This file is part of SpinalCore.
 * 
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 * 
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 * 
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

import "spinal-env-viewer-plugin-forge";
import * as _ from 'lodash';

import { SpinalGraphService, SpinalNode, SpinalNodeRef, SPINAL_RELATION_PTR_LST_TYPE } from "spinal-env-viewer-graph-service";
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { SpinalAttribute } from "spinal-model-timeseries";

// import { NetworkTreeService } from "./NetworkTreeService";
import { Model } from "spinal-core-connectorjs_type";


import { INamingConventionConfig } from "../data/INamingConvention";
import { IAggregateSelection } from "../data/IAggregateSelection";
import { INodeRefObj } from "../data/INodeRefObj";
import { IResult } from "../data/IResult";
import { IProperty } from "../data/IProperty";
import { IPropertyFormatted } from "../data/IPropertyFormatted";
import { IForgeProperty } from "../data/IForgeProperty";
import { IAttributeConfig } from "../data/IAttributeConfig";

import { NETWORK_BIMOJECT_RELATION, NETWORK_TYPE, OBJECT_ATTR, PLC_ATTR, ATTRIBUTE_CATEGORY, NETWORK_RELATION } from "../data/constants";

import { AttributesUtilities } from '../utilities/AttributesUtilities';


// const spinalForgeViewer = new SpinalForgeViewer();
const g_win: any = typeof window === "undefined" ? global : window;
const bimObjectService = g_win.spinal.BimObjectService;

export default abstract class GenerateNetworkTreeService {

   public static async getElementProperties(items: IAggregateSelection | Array<IAggregateSelection>, attributeName: string, namingConventionConfig: INamingConventionConfig): Promise<IResult> {

      if (!Array.isArray(items)) items = [items];

      const promises = items.map(({ model, selection }) => {
         return this._getItemPropertiesFormatted(model, selection, attributeName, namingConventionConfig);
      });

      return Promise.all(promises).then((result) => {
         const resultFlatted = _.flattenDeep(result);

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

   public static async createTree(automates: Array<IProperty>, equipments: Array<IProperty>, attrConfig: IAttributeConfig): Promise<{ tree: IPropertyFormatted[]; invalids: IPropertyFormatted[]; valids: IPropertyFormatted[]; }> {
      return this._getTreeArray(automates, equipments, attrConfig).then(async ({ tree, valids, invalids }) => {
         const treeL = await this._TransformArrayToTree(tree);
         return {
            tree: treeL,
            invalids,
            valids
         }

      })

   }

   public static createTreeNodes(contextId: string, nodeId: string, tree: Array<{ children: Array<INodeRefObj> }>, dontCreateEmptyAutomate: boolean = true): Promise<SpinalNode<any>[]> {
      if (dontCreateEmptyAutomate) {
         tree = tree.filter(el => el.children.length > 0);
      }
      const promises = tree.map(el => this._createNodes(contextId, <any>el, nodeId));
      return Promise.all(promises).then((result) => {
         return _.flattenDeep(result)
      })

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

   public static async _createNodes(contextId: string, node: IPropertyFormatted, parentNodeId: string): Promise<SpinalNode<any> | SpinalNode<any>[]> {
      let id;
      let relationName;

      if (node.dbId) {
         id = await this._createBimObjectNode(node);
         relationName = NETWORK_BIMOJECT_RELATION
      } else {
         id = SpinalGraphService.createNode({
            name: node.name,
            type: NETWORK_TYPE,
            color: node.color,
            isAutomate: node.isAutomate
         }, new Model());
         relationName = NETWORK_RELATION
      }

      return this._addSpinalAttribute(id, node.namingConvention).then(async () => {
         try {
            await SpinalGraphService.addChildInContext(parentNodeId, id, contextId, relationName, SPINAL_RELATION_PTR_LST_TYPE);
         } catch (error) { }

         if (node.children && node.children.length > 0) {
            const promises = node.children.map(el => this._createNodes(contextId, el, id));
            return Promise.all(promises).then((result) => {
               return _.flattenDeep(result);
            })
         }

         return SpinalGraphService.getRealNode(id);
      })
   }

   ////////////////////////////////////////////////////////////////////////////////
   ////                                PRIVATES                                  //
   ////////////////////////////////////////////////////////////////////////////////

   private static _getItemPropertiesFormatted(model: any, dbIds: Array<number>, attributeName: string, namingConventionConfig: INamingConventionConfig): Promise<IProperty[]> {
      const promises = dbIds.map(async dbid => {

         const obj = { model, dbId: dbid };
         obj["property"] = await AttributesUtilities.findAttribute(model, dbid, attributeName);

         if (namingConventionConfig) {
            const namingCProperty = await AttributesUtilities.findAttribute(model, dbid, namingConventionConfig.attributeName)
            obj["namingConvention"] = await this._getNamingConvention(namingCProperty, namingConventionConfig);
         }

         return obj;
      })

      return Promise.all(promises)
   }


   private static async _getTreeArray(items: Array<IProperty>, equipments: Array<IProperty>, attrConfig: IAttributeConfig): Promise<{
      tree: IPropertyFormatted[], valids: IPropertyFormatted[],
      invalids: IPropertyFormatted[]
   }> {

      const tree = await this._formatAutomateAttribute(items);

      const invalids = [];
      const valids = [];
      const subList = _.chunk(equipments, 100);

      const promises = subList.map(el => {
         return this._formatEquipmentAttribute(tree, el, attrConfig)
      })

      return Promise.all(promises).then((result) => {
         const resultFlatted = _.flattenDeep(result);
         for (const item of resultFlatted) {
            if (item.parentId !== "noParent") {
               tree.push(item);
               valids.push(item);
            } else {
               invalids.push(item);
            }
         }

         return {
            tree: tree,
            valids: valids,
            invalids: invalids
         }
      })
   }

   private static _formatAutomateAttribute(items: Array<IProperty>): Promise<IPropertyFormatted[]> {
      const promises = items.map((el: any) => {
         return this._getBimObjectName(el).then((result) => {
            el.id = result.dbId;
            el.name = result.name;
            el.property = el.property.displayValue;
            el.isAutomate = true;
            el.color = this._generateRandomColor();
            return el;
         })
      })

      return Promise.all(promises);
   }

   private static _formatEquipmentAttribute(tree: IPropertyFormatted[], equipments: IPropertyFormatted[], attrConfig: IAttributeConfig): Promise<IPropertyFormatted[]> {

      const promises = [];

      for (const element of equipments) {
         promises.push(this._formatItem(tree, element, attrConfig));
      }

      return Promise.all(promises);

   }

   private static async _formatItem(tree: IPropertyFormatted[], element: IPropertyFormatted, attrConfig: IAttributeConfig): Promise<IPropertyFormatted> {
      const obj: IPropertyFormatted = {
         model: element.model,
         namingConvention: element.namingConvention,
         dbId: element.dbId,
         externalId: element.externalId,
         id: element.dbId,
         children: [],
         parentId: "noParent"
      }

      let parent = this.getElementAut(tree, element, attrConfig);

      if (parent && parent.dbId !== obj.dbId) {
         // console.log("parent found", parent.name);
         obj.parentId = parent.id;
      }

      return obj;
   }

   private static async _createBimObjectNode({ dbId, model, color, isAutomate }: IPropertyFormatted): Promise<string> {

      const element = await this._getBimObjectName({ dbId, model })
      // const element = elements[0];

      return bimObjectService.createBIMObject(element.dbId, element.name, model).then((node: SpinalNodeRef | SpinalNode<any>) => {
         // const nodeId = node instanceof SpinalNode ? node.getId().get() : node.id.get();
         const realNode = node instanceof SpinalNode ? node : SpinalGraphService.getRealNode(node.id.get());

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

         return realNode.getId().get();
      })
   }

   private static _getBimObjectName({ dbId, model }: { dbId: number, model: any }): Promise<{ dbId: number, name: string }> {
      return new Promise((resolve) => {
         model.getBulkProperties([dbId], {
            propFilter: ['name']
         }, (el) => {
            resolve(el[0]);
         })
      });
   }

   private static _TransformArrayToTree(items: IPropertyFormatted[]): IPropertyFormatted[] {

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

   private static _generateRandomColor(): string {
      const randomColor = Math.floor(Math.random() * 16777215).toString(16);
      return '#' + randomColor;
   }

   private static getElementAut(tree: IPropertyFormatted[], item: IPropertyFormatted, attrConfig: IAttributeConfig): IPropertyFormatted {
      const elementAttribute = item.property.displayValue;

      if (attrConfig.isRegex) {

         const flags = attrConfig.flags.join('');

         return eval(`tree.find(element => {
            const select = attrConfig.select.replace('${OBJECT_ATTR}', elementAttribute).replace('${PLC_ATTR}', element.property);
            const text = attrConfig.text.replace('${OBJECT_ATTR}', elementAttribute).replace('${PLC_ATTR}', element.property);
            const regex = new RegExp(text,flags)
            const res = (select + "").match(regex);
            
            return res ? true : false;
         })`)

      } else {

         return eval(
            `tree.find(element => {
               return (${attrConfig.callback})(element.property, elementAttribute); 
            })`
         )
      }
   }

   private static async _getNamingConvention(property: IForgeProperty, namingConventionConfig: INamingConventionConfig): Promise<string> {
      if (property && ((property.displayValue + '').length > 0)) {
         const value = property.displayValue;

         return namingConventionConfig.useAttrValue ? value : eval(`(${namingConventionConfig.personalized.callback})('${value}')`)
      }
   }

   private static async _addSpinalAttribute(id: string, namingConvention: string): Promise<SpinalAttribute> {
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