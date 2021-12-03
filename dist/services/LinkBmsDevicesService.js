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
const LinkNetworkTreeService_1 = require("./LinkNetworkTreeService");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
const constants_1 = require("../data/constants");
const DeviceProfileUtilities_1 = require("../utilities/DeviceProfileUtilities");
class LinkBmsDeviceService {
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
    static getBmsEndpointsMap(bmsContextId, bmsDeviceId) {
        const bmsDeviceMap = new Map();
        return spinal_env_viewer_graph_service_1.SpinalGraphService.findInContext(bmsDeviceId, bmsContextId, (node) => {
            if (node.getType().get() === spinal_model_bmsnetwork_1.SpinalBmsEndpoint.nodeTypeName) {
                spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
                bmsDeviceMap.set(`${node.info.typeId.get()}_${node.info.idNetwork.get()}`, node.info.get());
                return true;
            }
            return false;
        }).then(() => {
            return bmsDeviceMap;
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
            const firstElement = first.map.get(key);
            const secondElement = second.map.get(key);
            if (firstElement && secondElement) {
                try {
                    // return Promise.all([
                    return spinal_env_viewer_graph_service_1.SpinalGraphService.addChild(firstElement[first.key], secondElement[second.key], relationName, relationType);
                    // SpinalGraphService.addChild(bmsElement.id, bimElement.nodeId, OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE)
                    // ])
                }
                catch (error) {
                }
            }
        });
        return Promise.all(promises);
    }
    static _unLinkTwoMaps(map1, map2, relationName, relationType, linkFirstToSecond = true) {
        const firstMap = linkFirstToSecond ? map1 : map2;
        const secondMap = linkFirstToSecond ? map2 : map1;
        const keys = Array.from(firstMap.keys());
        const promises = keys.map(key => {
            const firstElement = firstMap.get(key);
            const secondElement = secondMap.get(key);
            if (firstElement && secondElement) {
                try {
                    // return Promise.all([
                    return spinal_env_viewer_graph_service_1.SpinalGraphService.removeChild(firstElement.parentId, secondElement.id, relationName, relationType);
                    // SpinalGraphService.addChild(bmsElement.id, bimElement.nodeId, OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE)
                    // ])
                }
                catch (error) {
                }
            }
        });
        return Promise.all(promises);
    }
}
exports.default = LinkBmsDeviceService;
exports.LinkBmsDeviceService = LinkBmsDeviceService;
//# sourceMappingURL=LinkBmsDevicesService.js.map