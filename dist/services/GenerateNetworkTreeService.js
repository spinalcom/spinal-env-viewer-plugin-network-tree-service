"use strict";
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
exports.GenerateNetworkTreeService = void 0;
require("spinal-env-viewer-plugin-forge");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const constants_1 = require("../data/constants");
const AttributesUtilities_1 = require("../utilities/AttributesUtilities");
// import { NetworkTreeService } from "./NetworkTreeService";
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const _ = require("lodash");
const utilities_1 = require("../utilities/utilities");
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
            // const data = await bimObjectManagerService.getBimObjectProperties(items);
            // for (const item of data) {
            //    promises.push(this._getItemPropertiesFormatted(item.model, item.properties, attributeName, namingConventionConfig));
            // }
            return Promise.all(promises).then((result) => {
                // console.log("result", result);
                const resultFlatted = utilities_1.default._flatten(result);
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
    static createTree(automates, equipments, config) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._getTreeArray(automates, equipments, config).then(({ tree, valids, invalids }) => __awaiter(this, void 0, void 0, function* () {
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
        return Promise.all(promises);
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
    static _createNodes(contextId, node, parentId) {
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
                    yield spinal_env_viewer_graph_service_1.SpinalGraphService.addChildInContext(parentId, id, contextId, relationName, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
                }
                catch (error) { }
                if (node.children && node.children.length > 0) {
                    return Promise.all(node.children.map(el => this._createNodes(contextId, el, id)));
                }
                return spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(id);
            }));
        });
    }
    ////////////////////////////////////////////////////////////////////////////////
    ////                                PRIVATES                                  //
    ////////////////////////////////////////////////////////////////////////////////
    static _getItemPropertiesFormatted(model, itemList, attributeName, namingConventionConfig) {
        const promises = itemList.map((dbid) => __awaiter(this, void 0, void 0, function* () {
            // el.model = model;
            // el.property = this._getAttributeByName(el.properties, attributeName);
            // if (namingConventionConfig) {
            //    el.namingConvention = await this._getNamingConvention(el, namingConventionConfig);
            // }
            // return el;
            const obj = { model, dbId: dbid };
            obj["property"] = yield AttributesUtilities_1.AttributesUtilities.findAttribute(model, dbid, attributeName);
            if (namingConventionConfig) {
                obj["namingConvention"] = yield this._getNamingConvention(obj.property, namingConventionConfig);
            }
            return obj;
        }));
        return Promise.all(promises);
    }
    static _getBimObjectName({ dbId, model }) {
        return new Promise((resolve, reject) => {
            model.getBulkProperties([dbId], {
                propFilter: ['name']
            }, (el) => {
                resolve(el);
            });
        });
    }
    static _getTreeArray(items, equipments, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const tree = yield this._formatAutomateAttribute(items);
            const invalids = [];
            const valids = [];
            const subList = _.chunk(equipments, 100);
            const promises = subList.map(el => {
                return this._formatEquipmentAttribute(tree, el, config);
            });
            return Promise.all(_.flattenDeep(promises)).then((result) => {
                for (const ite of result) {
                    if (ite.parentId !== "noParent") {
                        tree.push(ite);
                        valids.push(ite);
                    }
                    else {
                        invalids.push(ite);
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
        const promises = items.map(el => {
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
    static _formatEquipmentAttribute(tree, equipments, config) {
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
    static _formatItem(tree, element, config) {
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
            let parent = this.getElementAut(tree, element, config);
            if (parent && parent.dbId !== obj.dbId) {
                // console.log("parent found", parent.name);
                obj.parentId = parent.id;
            }
            return obj;
        });
    }
    static _createBimObjectNode({ dbId, model, color, isAutomate }) {
        return __awaiter(this, void 0, void 0, function* () {
            const elements = yield this._getBimObjectName({ dbId, model });
            const element = elements[0];
            return bimObjectService.createBIMObject(element.dbId, element.name, model).then((node) => {
                const nodeId = node.id ? node.id.get() : node.info.id.get();
                const realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(nodeId);
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
                return nodeId;
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
    static getElementAut(tree, item, config) {
        const elementAttribute = item.property.displayValue;
        if (config.isRegex) {
            const flags = config.flags.join('');
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
               return (${config.callback})(element.property, elementAttribute); 
            })`);
        }
    }
    static _getNamingConvention(property, namingConventionConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            // const property = await this._getpropertyValue(node, namingConventionConfig.attributeName);
            if (property && ((property.displayValue + '').length > 0)) {
                const value = property.displayValue;
                return namingConventionConfig.useAttrValue ? value : eval(`(${namingConventionConfig.personalized.callback})('${value}')`);
            }
        });
    }
    // private static async _getpropertyValue(node, attributeName) {
    //    let properties = node.properties;
    //    if (typeof properties === "undefined") {
    //       const res = await bimObjectManagerService.getBimObjectProperties([{ model: node.model, selection: [node.dbId] }]);
    //       properties = res[0].properties;
    //    }
    //    return this._getAttributeByName(properties, attributeName);
    // }
    // private static _getAttributeByName(properties, propertyName) {
    //    return properties.find((obj) => {
    //       return (obj.displayName === propertyName || obj.attributeName === propertyName) && (obj.displayValue && ((obj.displayValue + '').length > 0))
    //    });
    // }
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