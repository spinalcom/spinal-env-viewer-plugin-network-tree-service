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
exports.LinkNetworkTreeService = void 0;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const DeviceProfileUtilities_1 = require("../utilities/DeviceProfileUtilities");
const constants_1 = require("../data/constants");
class LinkNetworkTreeService {
    static createMaps(physicalAutomates, virtualAutomates) {
        return __awaiter(this, void 0, void 0, function* () {
            let map = new Map();
            const promises = physicalAutomates.map((el) => __awaiter(this, void 0, void 0, function* () {
                return {
                    key: el.id,
                    values: yield this._getFormatedValues(el, virtualAutomates)
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
            return Promise.all(promises).then((result) => {
                return spinal_env_viewer_graph_service_1.SpinalGraphService.removeChild(automateId, profilId, constants_1.AUTOMATES_TO_PROFILE_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
            });
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
            return spinal_env_viewer_graph_service_1.SpinalGraphService.addChild(automateItemId, profilItemId, constants_1.OBJECT_TO_BACNET_ITEM_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
        });
    }
    static getProfilLinked(automateId) {
        return __awaiter(this, void 0, void 0, function* () {
            const children = yield spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(automateId, [constants_1.AUTOMATES_TO_PROFILE_RELATION]);
            return children.length > 0 ? children[0].id.get() : undefined;
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
        return __awaiter(this, void 0, void 0, function* () {
            const automateInfo = spinal_env_viewer_graph_service_1.SpinalGraphService.getInfo(automateId).get();
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
    ////////////////////////////////////////////////////////////////////////////
    ////                       PRIVATES                                       //
    ////////////////////////////////////////////////////////////////////////////
    static _getAutomateItems(automateId) {
        return spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(automateId, [constants_1.NETWORK_BIMOJECT_RELATION]).then((bimObjects) => {
            return bimObjects.map(el => el.get());
        });
    }
    static _getFormatedValues(automateInfo, virtualAutomates) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = { valids: [], invalidAutomateItems: [], invalidProfileItems: [], automate: automateInfo };
            const devices = yield this._getAutomateItems(automateInfo.id);
            let remainingItems = JSON.parse(JSON.stringify(virtualAutomates));
            for (const device of devices) {
                let index;
                const found = remainingItems.find((el, i) => {
                    if (el.namingConvention === device.namingConvention) {
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
    static _createRelationBetweenNodes(automateId, deviceProfilId, itemsValids) {
        const promises = itemsValids.map(({ automateItem, profileItem }) => {
            return this.linkAutomateItemToProfilItem(automateItem.id, profileItem.id);
        });
        return Promise.all(promises).then(() => {
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
}
exports.default = LinkNetworkTreeService;
exports.LinkNetworkTreeService = LinkNetworkTreeService;
//# sourceMappingURL=LinkNetworTreeService.js.map