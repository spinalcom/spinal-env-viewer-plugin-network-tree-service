"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("spinal-env-viewer-plugin-forge");
const _ = require("lodash");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
// import { NetworkTreeService } from "./NetworkTreeService";
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const constants_1 = require("../data/constants");
const AttributesUtilities_1 = require("../utilities/AttributesUtilities");
// const spinalForgeViewer = new SpinalForgeViewer();
const g_win = typeof window === "undefined" ? global : window;
const bimObjectService = g_win.spinal.BimObjectService;
class GenerateNetworkTreeService {
    static getElementProperties(items, attributeName, namingConventionConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Array.isArray(items))
                items = [items];
            const promises = items.map(({ model, selection }) => {
                return this._getItemPropertiesFormatted(model, selection, attributeName, namingConventionConfig);
            });
            return Promise.all(promises).then((result) => {
                const resultFlatted = _.flattenDeep(result);
                const res = {
                    validItems: [],
                    invalidItems: []
                };
                for (const el of resultFlatted) {
                    if (el.property) {
                        res.validItems.push(el);
                    }
                    else {
                        res.invalidItems.push(el);
                    }
                }
                return res;
            });
        });
    }
    static createTree(automates, equipments, attrConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._getTreeArray(automates, equipments, attrConfig).then(({ tree, valids, invalids }) => __awaiter(this, void 0, void 0, function* () {
                const treeL = yield this._TransformArrayToTree(tree);
                return {
                    tree: treeL,
                    invalids,
                    valids
                };
            }));
        });
    }
    static createTreeNodes(contextId, nodeId, tree, dontCreateEmptyAutomate = true) {
        if (dontCreateEmptyAutomate) {
            tree = tree.filter(el => el.children.length > 0);
        }
        const promises = tree.map(el => this._createNodes(contextId, el, nodeId));
        return Promise.all(promises).then((result) => {
            return _.flattenDeep(result);
        });
    }
    static classifyDbIdsByModel(items) {
        const res = [];
        for (const { dbId, model } of items) {
            const found = res.find(el => el.model.id === model.id);
            if (found)
                found.ids.push(dbId);
            else
                res.push({ model, ids: [dbId] });
        }
        return res;
    }
    static _createNodes(contextId, node, parentNodeId) {
        return __awaiter(this, void 0, void 0, function* () {
            let id;
            let relationName;
            if (node.dbId) {
                id = yield this._createBimObjectNode(node);
                relationName = constants_1.NETWORK_BIMOJECT_RELATION;
            }
            else {
                id = spinal_env_viewer_graph_service_1.SpinalGraphService.createNode({
                    name: node.name,
                    type: constants_1.NETWORK_TYPE,
                    color: node.color,
                    isAutomate: node.isAutomate
                }, new spinal_core_connectorjs_type_1.Model());
                relationName = constants_1.NETWORK_RELATION;
            }
            return this._addSpinalAttribute(id, node.namingConvention).then(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield spinal_env_viewer_graph_service_1.SpinalGraphService.addChildInContext(parentNodeId, id, contextId, relationName, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
                }
                catch (error) { }
                if (node.children && node.children.length > 0) {
                    const promises = node.children.map(el => this._createNodes(contextId, el, id));
                    return Promise.all(promises).then((result) => {
                        return _.flattenDeep(result);
                    });
                }
                return spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(id);
            }));
        });
    }
    ////////////////////////////////////////////////////////////////////////////////
    ////                                PRIVATES                                  //
    ////////////////////////////////////////////////////////////////////////////////
    static _getItemPropertiesFormatted(model, dbIds, attributeName, namingConventionConfig) {
        const promises = dbIds.map((dbid) => __awaiter(this, void 0, void 0, function* () {
            const obj = { model, dbId: dbid };
            obj["property"] = yield AttributesUtilities_1.AttributesUtilities.findAttribute(model, dbid, attributeName);
            if (namingConventionConfig) {
                const namingCProperty = yield AttributesUtilities_1.AttributesUtilities.findAttribute(model, dbid, namingConventionConfig.attributeName);
                obj["namingConvention"] = yield this._getNamingConvention(namingCProperty, namingConventionConfig);
            }
            return obj;
        }));
        return Promise.all(promises);
    }
    static _getTreeArray(items, equipments, attrConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const tree = yield this._formatAutomateAttribute(items);
            const invalids = [];
            const valids = [];
            const subList = _.chunk(equipments, 100);
            const promises = subList.map(el => {
                return this._formatEquipmentAttribute(tree, el, attrConfig);
            });
            return Promise.all(promises).then((result) => {
                const resultFlatted = _.flattenDeep(result);
                for (const item of resultFlatted) {
                    if (item.parentId !== "noParent") {
                        tree.push(item);
                        valids.push(item);
                    }
                    else {
                        invalids.push(item);
                    }
                }
                return {
                    tree: tree,
                    valids: valids,
                    invalids: invalids
                };
            });
        });
    }
    static _formatAutomateAttribute(items) {
        const promises = items.map((el) => {
            return this._getBimObjectName(el).then((result) => {
                el.id = result[0].dbId;
                el.name = result[0].name;
                el.property = el.property.displayValue;
                el.isAutomate = true;
                el.color = this._generateRandomColor();
                return el;
            });
        });
        return Promise.all(promises);
    }
    static _formatEquipmentAttribute(tree, equipments, attrConfig) {
        const promises = [];
        for (const element of equipments) {
            promises.push(this._formatItem(tree, element, attrConfig));
        }
        return Promise.all(promises);
    }
    static _formatItem(tree, element, attrConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = {
                model: element.model,
                namingConvention: element.namingConvention,
                dbId: element.dbId,
                externalId: element.externalId,
                id: element.dbId,
                children: [],
                parentId: "noParent"
            };
            let parent = this.getElementAut(tree, element, attrConfig);
            if (parent && parent.dbId !== obj.dbId) {
                // console.log("parent found", parent.name);
                obj.parentId = parent.id;
            }
            return obj;
        });
    }
    static _createBimObjectNode({ dbId, model, color, isAutomate }) {
        return __awaiter(this, void 0, void 0, function* () {
            const element = yield this._getBimObjectName({ dbId, model });
            // const element = elements[0];
            return bimObjectService.createBIMObject(element.dbId, element.name, model).then((node) => {
                // const nodeId = node instanceof SpinalNode ? node.getId().get() : node.id.get();
                const realNode = node instanceof spinal_env_viewer_graph_service_1.SpinalNode ? node : spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(node.id.get());
                if (realNode.info.color) {
                    realNode.info.color.set(color);
                }
                else {
                    realNode.info.add_attr({ color: color });
                }
                if (realNode.info.isAutomate) {
                    realNode.info.isAutomate.set(isAutomate);
                }
                else {
                    realNode.info.add_attr({ isAutomate: isAutomate });
                }
                return realNode.getId().get();
            });
        });
    }
    static _getBimObjectName({ dbId, model }) {
        return new Promise((resolve) => {
            model.getBulkProperties([dbId], {
                propFilter: ['name']
            }, (el) => {
                resolve(el[0]);
            });
        });
    }
    static _TransformArrayToTree(items) {
        const rootItems = [];
        const lookup = {};
        for (const item of items) {
            const itemId = item["id"];
            const parentId = item["parentId"];
            if (!lookup[itemId])
                lookup[itemId] = { ["children"]: [] };
            lookup[itemId] = Object.assign({}, item, { ["children"]: lookup[itemId]["children"] });
            const TreeItem = lookup[itemId];
            if (parentId === null || parentId === undefined || parentId === "") {
                rootItems.push(TreeItem);
            }
            else {
                if (!lookup[parentId])
                    lookup[parentId] = { ["children"]: [] };
                lookup[parentId]["children"].push(TreeItem);
            }
        }
        return rootItems;
    }
    static _generateRandomColor() {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        return '#' + randomColor;
    }
    static getElementAut(tree, item, attrConfig) {
        const elementAttribute = item.property.displayValue;
        if (attrConfig.isRegex) {
            const flags = attrConfig.flags.join('');
            return eval(`tree.find(element => {
            const select = config.select.replace('${constants_1.OBJECT_ATTR}', elementAttribute).replace('${constants_1.PLC_ATTR}', element.property);
            const text = config.text.replace('${constants_1.OBJECT_ATTR}', elementAttribute).replace('${constants_1.PLC_ATTR}', element.property);
            const regex = new RegExp(text,flags)
            const res = (select + "").match(regex);
            
            return res ? true : false;
         })`);
        }
        else {
            return eval(`tree.find(element => {
               return (${attrConfig.callback})(element.property, elementAttribute); 
            })`);
        }
    }
    static _getNamingConvention(property, namingConventionConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            if (property && ((property.displayValue + '').length > 0)) {
                const value = property.displayValue;
                return namingConventionConfig.useAttrValue ? value : eval(`(${namingConventionConfig.personalized.callback})('${value}')`);
            }
        });
    }
    static _addSpinalAttribute(id, namingConvention) {
        if (!namingConvention || namingConvention.length === 0)
            return;
        const realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(id);
        if (!realNode)
            return;
        return spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.addCategoryAttribute(realNode, constants_1.ATTRIBUTE_CATEGORY).then((attributeCategory) => {
            return spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.addAttributeByCategory(realNode, attributeCategory, "namingConvention", namingConvention);
        });
    }
}
exports.default = GenerateNetworkTreeService;
exports.GenerateNetworkTreeService = GenerateNetworkTreeService;
//# sourceMappingURL=GenerateNetworkTreeService.js.map