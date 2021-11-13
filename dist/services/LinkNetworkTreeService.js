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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const DeviceProfileUtilities_1 = require("../utilities/DeviceProfileUtilities");
const constants_1 = require("../data/constants");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const __1 = require("..");
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
class LinkNetworkTreeService {
    static createMaps(automateBims, profilItems) {
        return __awaiter(this, void 0, void 0, function* () {
            let map = new Map();
            const promises = automateBims.map((el) => __awaiter(this, void 0, void 0, function* () {
                return {
                    key: el.id,
                    values: yield this._getFormatedValues(el, profilItems)
                };
            }));
            const obj = yield Promise.all(promises);
            for (const iterator of obj) {
                map.set(iterator.key, iterator.values);
            }
            return map;
        });
    }
    static linkNodes(resultMaps, deviceProfilId) {
        const promises = [];
        resultMaps.forEach((value, key) => {
            promises.push(this.linkProfilToDevice(key, deviceProfilId, value.valids));
        });
        return Promise.all(promises);
    }
    static linkProfilToDevice(automateId, deviceProfilId, itemsValids) {
        return __awaiter(this, void 0, void 0, function* () {
            const profilLinked = yield this.getProfilLinked(automateId);
            if (profilLinked) {
                // if(profilLinked === deviceProfilId) return;
                yield this.unLinkDeviceToProfil(automateId, profilLinked);
            }
            return this._createRelationBetweenNodes(automateId, deviceProfilId, itemsValids);
        });
    }
    static linkAutomateItemToProfilItem(automateItemId, profilItemId) {
        return __awaiter(this, void 0, void 0, function* () {
            const children = yield spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(automateItemId, [constants_1.OBJECT_TO_BACNET_ITEM_RELATION]);
            if (children.length > 0) {
                const itemLinkedId = children[0].id.get();
                if (itemLinkedId === profilItemId)
                    return;
                yield this.unLinkAutomateItemToProfilItem(automateItemId, itemLinkedId);
            }
            try {
                return spinal_env_viewer_graph_service_1.SpinalGraphService.addChild(automateItemId, profilItemId, constants_1.OBJECT_TO_BACNET_ITEM_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
            }
            catch (error) {
            }
        });
    }
    static getProfilLinked(automateId) {
        return __awaiter(this, void 0, void 0, function* () {
            const children = yield spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(automateId, [constants_1.AUTOMATES_TO_PROFILE_RELATION]);
            return children.length > 0 ? children[0].id.get() : undefined;
        });
    }
    ////
    // supprimer un profil d'un automate
    static unLinkDeviceToProfil(automateId, argProfilId) {
        return __awaiter(this, void 0, void 0, function* () {
            let profilId = argProfilId;
            if (typeof profilId === "undefined") {
                profilId = yield this.getProfilLinked(automateId);
            }
            const itemsValids = yield this._getAutomateItems(automateId);
            const promises = itemsValids.map((automateItem) => __awaiter(this, void 0, void 0, function* () {
                return this.unLinkAutomateItemToProfilItem(automateItem.id);
            }));
            return Promise.all(promises).then((result) => __awaiter(this, void 0, void 0, function* () {
                yield spinal_env_viewer_graph_service_1.SpinalGraphService.removeChild(automateId, profilId, constants_1.AUTOMATES_TO_PROFILE_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
                const bmsDevicesWithTheSameProfil = yield this.getBmsDeviceWithTheSameProfil(automateId, argProfilId);
                const prom = bmsDevicesWithTheSameProfil.map((device) => __awaiter(this, void 0, void 0, function* () {
                    const contextId = this.getBmsDeviceContextId(device);
                    return __1.LinkBmsDeviceService.unLinkBmsDeviceToBimDevices(contextId, device.id.get(), automateId);
                }));
                yield Promise.all(prom);
                return true;
            }));
        });
    }
    static unLinkAutomateItemToProfilItem(automateItemId, profilItemId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof profilItemId !== "undefined") {
                return spinal_env_viewer_graph_service_1.SpinalGraphService.removeChild(automateItemId, profilItemId, constants_1.OBJECT_TO_BACNET_ITEM_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
            }
            const children = yield spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(automateItemId, [constants_1.OBJECT_TO_BACNET_ITEM_RELATION]);
            return Promise.all(children.map(el => spinal_env_viewer_graph_service_1.SpinalGraphService.removeChild(automateItemId, el.id.get(), constants_1.OBJECT_TO_BACNET_ITEM_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE)));
        });
    }
    static getDeviceAndProfilData(automateId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const automateInfo = ((_a = spinal_env_viewer_graph_service_1.SpinalGraphService.getInfo(automateId)) === null || _a === void 0 ? void 0 : _a.get()) || {};
            const res = { valids: [], invalidAutomateItems: [], invalidProfileItems: [], automate: automateInfo };
            const profilId = yield this.getProfilLinked(automateId);
            const automateItems = yield this._getAutomateItems(automateId);
            let profilItems = yield DeviceProfileUtilities_1.DeviceProfileUtilities.getItemsList(profilId);
            // const promises = automateItems.map(el => SpinalGraphService.getChildren(el.id,[this.OBJECT_TO_BACNET_ITEM_RELATION]));
            return this._waitForEach(automateItems, profilItems, res).then((result) => {
                res.invalidProfileItems = result;
                return res;
            });
        });
    }
    ////////////////////////////////////////////////////////////////////////////////////
    //                              private                                           //
    ////////////////////////////////////////////////////////////////////////////////////
    static _getFormatedValues(automateInfo, virtualAutomates) {
        // const devicesModels = await (SpinalGraphService.getChildren(automateId,[NETWORK_BIMOJECT_RELATION]))
        return Promise.all([this._getAutomateItems(automateInfo.id), this._formatVirtualAutomates(virtualAutomates)]).then(([devices, items]) => {
            const res = { valids: [], invalidAutomateItems: [], invalidProfileItems: [], automate: automateInfo };
            let remainingItems = JSON.parse(JSON.stringify(items));
            for (const device of devices) {
                let index;
                const found = remainingItems.find((el, i) => {
                    if (el.namingConvention && el.namingConvention === device.namingConvention) {
                        index = i;
                        return true;
                    }
                    return false;
                });
                if (found) {
                    remainingItems.splice(index, 1);
                    res.valids.push({ automateItem: device, profileItem: found });
                }
                else {
                    res.invalidAutomateItems.push(device);
                }
            }
            res.invalidProfileItems = remainingItems;
            return res;
        });
    }
    static _getAutomateItems(automateId) {
        return spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(automateId, [constants_1.NETWORK_BIMOJECT_RELATION]).then((bimObjects) => {
            const promises = bimObjects.map((el) => __awaiter(this, void 0, void 0, function* () {
                const temp = el.get();
                temp.namingConvention = yield this._getNamingConvention(temp.id, constants_1.ATTRIBUTE_CATEGORY);
                return temp;
            }));
            return Promise.all(promises);
        });
    }
    static _formatVirtualAutomates(profilItems) {
        const promises = profilItems.map((temp) => __awaiter(this, void 0, void 0, function* () {
            temp.namingConvention = yield this._getNamingConvention(temp.id, constants_1.ATTRIBUTE_CATEGORY);
            return temp;
        }));
        return Promise.all(promises);
    }
    static _getNamingConvention(nodeId, categoryName) {
        return __awaiter(this, void 0, void 0, function* () {
            const realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(nodeId);
            if (realNode) {
                const attributes = yield spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.getAttributesByCategory(realNode, categoryName);
                if (attributes && attributes.length > 0) {
                    const attr = attributes.find(el => el.label.get() === "namingConvention");
                    if (attr)
                        return attr.value.get();
                }
            }
        });
    }
    static _createRelationBetweenNodes(automateId, deviceProfilId, itemsValids) {
        const promises = itemsValids.map(({ automateItem, profileItem }) => {
            return this.linkAutomateItemToProfilItem(automateItem.id, profileItem.id);
        });
        return Promise.all(promises).then((result) => {
            return spinal_env_viewer_graph_service_1.SpinalGraphService.addChild(automateId, deviceProfilId, constants_1.AUTOMATES_TO_PROFILE_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
        });
    }
    static _waitForEach(automateItems, argProfilItems, res) {
        let profilItems = argProfilItems;
        const promises = automateItems.map((automateItem) => __awaiter(this, void 0, void 0, function* () {
            const children = yield spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(automateItem.id, [constants_1.OBJECT_TO_BACNET_ITEM_RELATION]);
            const child = children[0] && children[0].get();
            if (child) {
                res.valids.push({ automateItem, profileItem: child });
                profilItems = profilItems.filter(el => {
                    if (el.id !== child.id) {
                        return true;
                    }
                    return false;
                });
            }
            else {
                res.invalidAutomateItems.push(automateItem);
            }
            return true;
        }));
        return Promise.all(promises).then(() => {
            return profilItems;
        });
    }
    static getBmsDeviceWithTheSameProfil(bimDeviceId, profilId) {
        return __awaiter(this, void 0, void 0, function* () {
            const bmsDevices = yield spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(bimDeviceId, [spinal_model_bmsnetwork_1.SpinalBmsDevice.relationName]);
            return bmsDevices.filter(device => {
                const ids = spinal_env_viewer_graph_service_1.SpinalGraphService.getChildrenIds(device.id.get());
                return ids.findIndex(id => id === profilId) !== -1;
            });
        });
    }
    static getBmsDeviceContextId(nodeRef) {
        const contextIds = nodeRef.contextIds.values();
        return Array.from(contextIds).find(id => {
            const realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(id);
            return realNode.getType().get() === "Network";
        });
    }
}
exports.default = LinkNetworkTreeService;
exports.LinkNetworkTreeService = LinkNetworkTreeService;
//# sourceMappingURL=LinkNetworkTreeService.js.map