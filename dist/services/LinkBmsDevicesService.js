"use strict";
/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
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
exports.LinkBmsDeviceService = void 0;
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
const LinkNetworkTreeService_1 = require("./LinkNetworkTreeService");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
const constants_1 = require("../data/constants");
const DeviceProfileUtilities_1 = require("../utilities/DeviceProfileUtilities");
const AttributesUtilities_1 = require("../utilities/AttributesUtilities");
class LinkBmsDeviceService {
    static LinkBmsDeviceToBimDevicesUsingAttribute(bmsDeviceOpt, bimDeviceOpt) {
        return __awaiter(this, void 0, void 0, function* () {
            const [bmsDeviceMap, bimDevicesMap] = yield Promise.all([
                this.getBmsEndpointsMap(bmsDeviceOpt.contextId, bmsDeviceOpt.deviceId, bmsDeviceOpt.attribute),
                this.getBimAutomateMap(bimDeviceOpt.nodeId, bimDeviceOpt.model, bimDeviceOpt.attribute)
            ]);
            console.log("bimDevicesMap", bimDevicesMap);
            console.log("bmsDeviceMap", bmsDeviceMap);
            const bimObj = { key: "id", map: bimDevicesMap };
            const bmsObj = { key: "id", map: bmsDeviceMap };
            return this._linkTwoMaps(bimObj, bmsObj, spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE).then((result) => {
                try {
                    return spinal_env_viewer_graph_service_1.SpinalGraphService.addChild(bimDeviceOpt.nodeId, bmsDeviceOpt.deviceId, spinal_model_bmsnetwork_1.SpinalBmsDevice.relationName, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
                }
                catch (error) {
                    return false;
                }
            }).catch((err) => {
                return false;
            });
        });
    }
    static LinkBmsDeviceToBimDevices(bmsContextId, bmsDeviceId, bimDeviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bimProfilId = yield this.getBacnetProfilLinked(bimDeviceId);
                const bmsProfilId = yield this.getBacnetProfilLinked(bmsDeviceId);
                const profilId = bimProfilId || bmsProfilId;
                if (profilId) {
                    if (bmsProfilId && (profilId !== bmsProfilId)) {
                        yield this.unLinkProfilToBmsDevice(bmsContextId, bmsDeviceId);
                        yield this.linkProfilToBmsDevice(bmsContextId, bmsDeviceId, profilId);
                    }
                    const [bmsDevicesMap, bimDevicesMap] = yield Promise.all([this.getBmsEndpointsMap(bmsContextId, bmsDeviceId), LinkNetworkTreeService_1.LinkNetworkTreeService._getAutomateItemsMap(bimDeviceId)]);
                    ;
                    console.log("bmsDevicesMap", bmsDevicesMap);
                    console.log("bimDevicesMap", bimDevicesMap);
                    const bimObj = { key: "parentId", map: bimDevicesMap };
                    const bmsObj = { key: "id", map: bmsDevicesMap };
                    return this._linkTwoMaps(bimObj, bmsObj, spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE).then(() => __awaiter(this, void 0, void 0, function* () {
                        // await SpinalGraphService.addChild(bmsDeviceId, profilId, AUTOMATES_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
                        try {
                            yield spinal_env_viewer_graph_service_1.SpinalGraphService.addChild(bimDeviceId, bmsDeviceId, spinal_model_bmsnetwork_1.SpinalBmsDevice.relationName, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
                        }
                        catch (error) { }
                    }));
                }
                else {
                    throw new Error("Node profil linked to bim object and bms object");
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    static unLinkBmsDeviceToBimDevices(bmsContextId, bmsDeviceId, bimDeviceId, argProfilId, bimDeviceMap) {
        return __awaiter(this, void 0, void 0, function* () {
            const profilId = argProfilId || (yield this.getBacnetProfilLinked(bimDeviceId));
            if (profilId) {
                const bmsDeviceMapProm = this.getBmsEndpointsMap(bmsContextId, bmsDeviceId);
                const bimDeviceMapProm = bimDeviceMap ? Promise.resolve(bimDeviceMap) : LinkNetworkTreeService_1.LinkNetworkTreeService._getAutomateItemsMap(bimDeviceId);
                const [bmsDevicesMap, bimDevicesMap] = yield Promise.all([bmsDeviceMapProm, bimDeviceMapProm]);
                console.log("unLinkBmsDeviceToBimDevices", bmsDevicesMap, bimDevicesMap);
                this._unLinkTwoMaps(bimDevicesMap, bmsDevicesMap, spinal_model_bmsnetwork_1.SpinalBmsDevice.relationName, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE).then(() => __awaiter(this, void 0, void 0, function* () {
                    // await SpinalGraphService.removeChild(bmsDeviceId, profilId, AUTOMATES_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
                    try {
                        yield spinal_env_viewer_graph_service_1.SpinalGraphService.removeChild(bimDeviceId, bmsDeviceId, spinal_model_bmsnetwork_1.SpinalBmsDevice.relationName, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
                    }
                    catch (error) { }
                })).catch((err) => {
                });
            }
        });
    }
    static linkProfilToBmsDevice(bmsContextId, bmsDeviceId, profilId) {
        return __awaiter(this, void 0, void 0, function* () {
            const bimDeviceId = yield this.bmsDevicehasBimDevice(bmsDeviceId);
            // if (bimDeviceId) {
            //    await this.unLinkBmsDeviceToBimDevices(bmsContextId, bmsDeviceId, bimDeviceId);
            // } else {
            yield this.unLinkProfilToBmsDevice(bmsContextId, bmsDeviceId);
            // }
            const endpointMapPromise = this.getBmsEndpointsMap(bmsContextId, bmsDeviceId);
            const profilMapPromise = DeviceProfileUtilities_1.default.getBacnetValuesMap(profilId);
            const [bmsDevicesMap, profilDeviceMap] = yield Promise.all([endpointMapPromise, profilMapPromise]);
            // // const bmsDevicesMap: any = res[0];
            // // const profilDeviceMap: any = res[1];
            // const promises = Array.from(bmsDevicesMap.keys()).map(async key => {
            //    const bmsElement = bmsDevicesMap.get(key);
            //    const profilElement = profilDeviceMap.get(key);
            //    if (bmsElement && profilElement) {
            //       // console.log("inside if", bmsElement.name, profilElement.name);
            //       try {
            //          return SpinalGraphService.addChild(bmsElement.id, profilElement.id, OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE)
            //       } catch (error) { }
            //    }
            //    return;
            // })
            const bmsObj = { key: "id", map: bmsDevicesMap };
            const profilObj = { key: "id", map: profilDeviceMap };
            return this._linkTwoMaps(bmsObj, profilObj, constants_1.OBJECT_TO_BACNET_ITEM_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE).then((result) => {
                try {
                    return spinal_env_viewer_graph_service_1.SpinalGraphService.addChild(bmsDeviceId, profilId, constants_1.AUTOMATES_TO_PROFILE_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
                }
                catch (error) {
                    return false;
                }
            }).catch((err) => {
                return false;
            });
        });
    }
    static unLinkProfilToBmsDevice(bmsContextId, bmsDeviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            // const relations = SpinalGraphService.getRelationNames(bmsDeviceId);
            const bmsRealNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(bmsDeviceId);
            if (bmsRealNode.hasRelation(constants_1.AUTOMATES_TO_PROFILE_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE)) {
                return spinal_env_viewer_graph_service_1.SpinalGraphService.findInContext(bmsDeviceId, bmsContextId, (node) => {
                    if (node.hasRelation(constants_1.OBJECT_TO_BACNET_ITEM_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE)) {
                        return node.removeRelation(constants_1.OBJECT_TO_BACNET_ITEM_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
                    }
                    return false;
                }).then(() => __awaiter(this, void 0, void 0, function* () {
                    // if (node) {
                    yield bmsRealNode.removeRelation(constants_1.AUTOMATES_TO_PROFILE_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
                    return true;
                    // }
                    // return false;
                }));
            }
            return false;
        });
    }
    static getBmsEndpointsMap(bmsContextId, bmsDeviceId, attribute) {
        const bmsDeviceMap = new Map();
        const context = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(bmsContextId);
        const device = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(bmsDeviceId);
        if (!context || !device)
            return Promise.resolve(bmsDeviceMap);
        return device.findInContextAsyncPredicate(context, (node) => __awaiter(this, void 0, void 0, function* () {
            if (node.getType().get() === spinal_model_bmsnetwork_1.SpinalBmsEndpoint.nodeTypeName) {
                //@ts-ignore
                spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
                let key;
                if (!attribute) {
                    // bmsDeviceMap.set(`${node.info.typeId.get()}_${node.info.idNetwork.get()}`, node.info.get());
                    key = `${node.info.typeId.get()}_${node.info.idNetwork.get()}`;
                }
                else {
                    const attr = yield AttributesUtilities_1.default.findSpinalAttributeById(node.getId().get(), attribute);
                    key = attr === null || attr === void 0 ? void 0 : attr.displayValue;
                }
                if (key) {
                    let value = bmsDeviceMap.get(key) || [];
                    value.push(node.info.get());
                    bmsDeviceMap.set(key, value);
                }
                return true;
            }
            return false;
        })).then(() => {
            return bmsDeviceMap;
        });
    }
    static getBimAutomateMap(automateId, model, attribute) {
        return __awaiter(this, void 0, void 0, function* () {
            const automates = yield LinkNetworkTreeService_1.LinkNetworkTreeService._getAutomateItems(automateId);
            const map = new Map();
            yield automates.reduce((prom, item) => __awaiter(this, void 0, void 0, function* () {
                const liste = yield prom;
                const attr = yield AttributesUtilities_1.default.findAttribute(model, item.dbid, attribute, item.id);
                if (attr) {
                    const value = map.get(attr.displayValue) || [];
                    value.push(item);
                    map.set(attr.displayValue, value);
                }
                return liste;
            }), Promise.resolve([]));
            return map;
        });
    }
    static bmsDevicehasBimDevice(bmsDeviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const children = yield spinal_env_viewer_graph_service_1.SpinalGraphService.getParents(bmsDeviceId, [spinal_model_bmsnetwork_1.SpinalBmsDevice.relationName]);
            if (children.length > 0)
                children[0].id ? children[0].id.get() : undefined;
        });
    }
    static getBacnetProfilLinked(nodeId) {
        return spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(nodeId, [constants_1.AUTOMATES_TO_PROFILE_RELATION]).then((children) => {
            console.log("children", children);
            if (children.length > 0)
                return children[0].id.get();
        });
    }
    // private static _getAutomateItems(automateId: string): Promise<Map<number, any>> {
    //    const bimDeviceMap = new Map();
    //    return LinkNetworkTreeService.getDeviceAndProfilData(automateId).then((result) => {
    //       const promises = result.valids.map(async ({ automateItem, profileItem }) => {
    //          const attrs = await DeviceProfileUtilities.getMeasures(profileItem.id);
    //          for (const attr of attrs) {
    //             (<any>attr).parentId = automateItem.id;
    //             bimDeviceMap.set(`${attr.typeId}_${(parseInt((<any>attr).IDX) + 1)}`, attr);
    //          }
    //          return;
    //       })
    //       return Promise.all(promises).then(() => {
    //          return bimDeviceMap;
    //       })
    //    })
    // }
    static _linkTwoMaps(map1, map2, relationName, relationType, linkFirstToSecond = true) {
        const first = linkFirstToSecond ? map1 : map2;
        const second = linkFirstToSecond ? map2 : map1;
        const keys = Array.from(first.map.keys());
        const promises = keys.map(key => {
            let firstElement = first.map.get(key);
            let secondElement = second.map.get(key);
            if (firstElement && secondElement) {
                if (!Array.isArray(firstElement))
                    firstElement = [firstElement];
                if (!Array.isArray(secondElement))
                    secondElement = [secondElement];
                const ids = secondElement.map(el => el[second.key]);
                return firstElement.reduce((liste, item) => __awaiter(this, void 0, void 0, function* () {
                    yield this._createOrRemoveRelation(item[first.key], ids, relationName, relationType, true);
                    return liste;
                }), Promise.resolve([]));
                // try {
                //    // return Promise.all([
                //    return SpinalGraphService.addChild(firstElement[first.key], secondElement[second.key], relationName, relationType)
                //    // SpinalGraphService.addChild(bmsElement.id, bimElement.nodeId, OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE)
                //    // ])
                // } catch (error) {
                // }
            }
        });
        return Promise.all(promises);
    }
    static _unLinkTwoMaps(map1, map2, relationName, relationType, linkFirstToSecond = true) {
        const firstMap = linkFirstToSecond ? map1 : map2;
        const secondMap = linkFirstToSecond ? map2 : map1;
        const keys = Array.from(firstMap.keys());
        const promises = keys.map(key => {
            let firstElement = firstMap.get(key);
            let secondElement = secondMap.get(key);
            if (firstElement && secondElement) {
                if (!Array.isArray(firstElement))
                    firstElement = [firstElement];
                if (!Array.isArray(secondElement))
                    secondElement = [secondElement];
                const ids = secondElement.map(el => el.id);
                return firstElement.reduce((liste, item) => __awaiter(this, void 0, void 0, function* () {
                    yield this._createOrRemoveRelation(item.parentId, ids, relationName, relationType, false);
                    return liste;
                }), Promise.resolve([]));
                // try {
                //    // return Promise.all([
                //    return SpinalGraphService.addChild(firstElement[first.key], secondElement[second.key], relationName, relationType)
                //    // SpinalGraphService.addChild(bmsElement.id, bimElement.nodeId, OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE)
                //    // ])
                // } catch (error) {
                // }
            }
        });
        return Promise.all(promises);
    }
    static _createOrRemoveRelation(parentId, childIds, relationName, relationType, create) {
        if (!Array.isArray(childIds))
            childIds = [childIds];
        const promises = childIds.map(el => {
            try {
                if (create)
                    return spinal_env_viewer_graph_service_1.SpinalGraphService.addChild(parentId, el, relationName, relationType);
                return spinal_env_viewer_graph_service_1.SpinalGraphService.removeChild(parentId, el, relationName, relationType);
            }
            catch (error) {
            }
        });
    }
}
exports.default = LinkBmsDeviceService;
exports.LinkBmsDeviceService = LinkBmsDeviceService;
//# sourceMappingURL=LinkBmsDevicesService.js.map