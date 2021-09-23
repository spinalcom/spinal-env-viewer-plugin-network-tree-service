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
exports.LinkBmsDeviceService = void 0;
const LinkNetworkTreeService_1 = require("./LinkNetworkTreeService");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_model_bmsnetwork_1 = require("spinal-model-bmsnetwork");
const constants_1 = require("../data/constants");
const DeviceProfileUtilities_1 = require("../utilities/DeviceProfileUtilities");
class LinkBmsDeviceService {
    static LinkBmsDeviceToBimDevices(bmsContextId, bmsDeviceId, bimDeviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profilId = yield this._getBacnetProfilLinked(bimDeviceId);
            if (profilId) {
                yield this.unLinkProfilToBmsDevice(bmsContextId, bmsDeviceId);
                const promises = [this.getBmsEndpointsMap(bmsContextId, bmsDeviceId), this._getAutomateItems(bimDeviceId)];
                const [bmsDevicesMap, bimDevicesMap] = yield Promise.all(promises);
                ;
                const promises2 = Array.from(bimDevicesMap.keys()).map(key => {
                    const bmsElement = bmsDevicesMap.get(key);
                    const value = bimDevicesMap.get(key);
                    if (bmsElement && value) {
                        return Promise.all([
                            spinal_env_viewer_graph_service_1.SpinalGraphService.addChild(value.parentId, bmsElement.id, spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE),
                            spinal_env_viewer_graph_service_1.SpinalGraphService.addChild(bmsElement.id, value.nodeId, constants_1.OBJECT_TO_BACNET_ITEM_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE)
                        ]);
                    }
                    return;
                });
                try {
                    yield Promise.all(promises2);
                }
                catch (error) {
                }
                try {
                    yield spinal_env_viewer_graph_service_1.SpinalGraphService.addChild(bmsDeviceId, profilId, constants_1.AUTOMATES_TO_PROFILE_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
                    yield spinal_env_viewer_graph_service_1.SpinalGraphService.addChild(bimDeviceId, bmsDeviceId, spinal_model_bmsnetwork_1.SpinalBmsDevice.relationName, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
                    return;
                }
                catch (error) { }
            }
            else {
                throw new Error(`${bimDeviceId} has no profil linked`);
            }
        });
    }
    static unLinkBmsDeviceToBimDevices(bmsContextId, bmsDeviceId, bimDeviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profilId = yield this._getBacnetProfilLinked(bimDeviceId);
            if (profilId) {
                const promises = [this.getBmsEndpointsMap(bmsContextId, bmsDeviceId), this._getAutomateItems(bimDeviceId)];
                const [bmsDevicesMap, bimDevicesMap] = yield Promise.all(promises);
                const promises2 = Array.from(bimDevicesMap.keys()).map(key => {
                    const bmsElement = bmsDevicesMap.get(key);
                    const value = bimDevicesMap.get(key);
                    if (bmsElement && value) {
                        return Promise.all([
                            spinal_env_viewer_graph_service_1.SpinalGraphService.removeChild(value.parentId, bmsElement.id, spinal_model_bmsnetwork_1.SpinalBmsEndpoint.relationName, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE),
                            spinal_env_viewer_graph_service_1.SpinalGraphService.removeChild(bmsElement.id, value.nodeId, constants_1.OBJECT_TO_BACNET_ITEM_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE)
                        ]);
                    }
                    return;
                });
                yield Promise.all(promises2);
                yield spinal_env_viewer_graph_service_1.SpinalGraphService.removeChild(bmsDeviceId, profilId, constants_1.AUTOMATES_TO_PROFILE_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
                yield spinal_env_viewer_graph_service_1.SpinalGraphService.removeChild(bimDeviceId, bmsDeviceId, spinal_model_bmsnetwork_1.SpinalBmsDevice.relationName, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
                return;
            }
        });
    }
    static linkProfilToBmsDevice(bmsContextId, bmsDeviceId, profilId) {
        return __awaiter(this, void 0, void 0, function* () {
            const bimDeviceId = yield this.bmsDevicehasBimDevice(bmsDeviceId);
            if (bimDeviceId) {
                yield this.unLinkBmsDeviceToBimDevices(bmsContextId, bmsDeviceId, bimDeviceId);
            }
            else {
                yield this.unLinkProfilToBmsDevice(bmsContextId, bmsDeviceId);
            }
            const endpointMapPromise = this.getBmsEndpointsMap(bmsContextId, bmsDeviceId);
            const profilMapPromise = DeviceProfileUtilities_1.default.getBacnetValuesMap(profilId);
            const res = yield Promise.all([endpointMapPromise, profilMapPromise]);
            const bmsDevicesMap = res[0];
            const profilDeviceMap = res[1];
            const promises = Array.from(bmsDevicesMap.keys()).map((key) => __awaiter(this, void 0, void 0, function* () {
                const bmsElement = bmsDevicesMap.get(key);
                const profilElement = profilDeviceMap.get(key);
                if (bmsElement && profilElement) {
                    // console.log("inside if", bmsElement.name, profilElement.name);
                    try {
                        return spinal_env_viewer_graph_service_1.SpinalGraphService.addChild(bmsElement.id, profilElement.id, constants_1.OBJECT_TO_BACNET_ITEM_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
                    }
                    catch (error) { }
                }
                return;
            }));
            yield Promise.all(promises);
            try {
                return spinal_env_viewer_graph_service_1.SpinalGraphService.addChild(bmsDeviceId, profilId, constants_1.AUTOMATES_TO_PROFILE_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
            }
            catch (error) {
            }
        });
    }
    static unLinkProfilToBmsDevice(bmsContextId, bmsDeviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const relations = spinal_env_viewer_graph_service_1.SpinalGraphService.getRelationNames(bmsDeviceId);
            if (relations.indexOf(constants_1.AUTOMATES_TO_PROFILE_RELATION) > -1) {
                return spinal_env_viewer_graph_service_1.SpinalGraphService.findInContext(bmsDeviceId, bmsContextId, (node) => {
                    if (node.hasRelation(constants_1.OBJECT_TO_BACNET_ITEM_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE)) {
                        return node.removeRelation(constants_1.OBJECT_TO_BACNET_ITEM_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
                    }
                    return false;
                }).then(() => __awaiter(this, void 0, void 0, function* () {
                    const node = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(bmsDeviceId);
                    if (node) {
                        yield node.removeRelation(constants_1.AUTOMATES_TO_PROFILE_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
                        return true;
                    }
                    return false;
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
    static _getBacnetProfilLinked(bimDeviceId) {
        return spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(bimDeviceId, [constants_1.AUTOMATES_TO_PROFILE_RELATION]).then((children) => {
            console.log("children", children);
            if (children.length > 0)
                return children[0].id.get();
        });
    }
    static _getAutomateItems(automateId) {
        const bimDeviceMap = new Map();
        return LinkNetworkTreeService_1.LinkNetworkTreeService.getDeviceAndProfilData(automateId).then((result) => {
            const promises = result.valids.map(({ automateItem, profileItem }) => __awaiter(this, void 0, void 0, function* () {
                const attrs = yield DeviceProfileUtilities_1.default.getItemIO(profileItem.id);
                for (const attr of attrs) {
                    attr.parentId = automateItem.id;
                    bimDeviceMap.set((parseInt(attr.IDX) + 1), attr);
                }
                return;
            }));
            return Promise.all(promises).then(() => {
                return bimDeviceMap;
            });
        });
    }
    static bmsDevicehasBimDevice(bmsDeviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const children = yield spinal_env_viewer_graph_service_1.SpinalGraphService.getParents(bmsDeviceId, [spinal_model_bmsnetwork_1.SpinalBmsDevice.relationName]);
            if (children.length > 0)
                children[0].id ? children[0].id.get() : undefined;
        });
    }
}
exports.default = LinkBmsDeviceService;
exports.LinkBmsDeviceService = LinkBmsDeviceService;
//# sourceMappingURL=LinkBmsDevicesService.js.map