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
exports.DeviceProfileUtilities = void 0;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const constants_1 = require("spinal-env-viewer-plugin-device_profile/constants");
const utilities_1 = require("../utilities/utilities");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const constants_2 = require("../data/constants");
class DeviceProfileUtilities {
    static getDevicesContexts() {
        const result = spinal_env_viewer_graph_service_1.SpinalGraphService.getContextWithType(this.DEVICE_PROFILE_CONTEXT);
        return result.map(el => el.info.get());
    }
    static getDeviceProfiles(contextId) {
        return spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(contextId, [constants_1.DEVICE_RELATION_NAME]).then((result) => {
            return result.map(el => el.get());
        }).catch((err) => {
            return [];
        });
    }
    static getDevices(profilId) {
        return spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(profilId, [constants_1.PART_RELATION_NAME]).then((result) => {
            return result.map(el => el.get());
        }).catch((err) => {
            return [];
        });
    }
    static getItemsList(deviceId) {
        return spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(deviceId, [this.ITEM_LIST_RELATION]).then((itemList) => {
            const promises = itemList.map(el => spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(el.id.get(), [this.ITEM_LIST_TO_ITEMS_RELATION]));
            return Promise.all(promises).then((items) => {
                return utilities_1.default._flatten(items).map(el => el.get());
            });
        }).catch((err) => {
            return [];
        });
    }
    static getItemInputs(itemId) {
        return spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(itemId, [this.INPUTS_RELATION]).then((children) => {
            const promises = children.map(el => spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(el.id.get(), [this.INPUT_RELATION]));
            return Promise.all(promises).then((result) => {
                const flattedResult = utilities_1.default._flatten(result);
                return flattedResult.map(el => el.get());
            });
        });
    }
    static getItemOutputs(itemId) {
        return spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(itemId, [this.OUTPUTS_RELATION]).then((children) => {
            const promises = children.map(el => spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(el.id.get(), [this.OUTPUT_RELATION]));
            return Promise.all(promises).then((result) => {
                const flattedResult = utilities_1.default._flatten(result);
                return flattedResult.map(el => el.get());
            });
        });
    }
    static getDeviceContextTreeStructure() {
        const contexts = this.getDevicesContexts();
        const promises = contexts.map((el) => __awaiter(this, void 0, void 0, function* () {
            const profils = yield this.getDeviceProfiles(el.id);
            const profilPromises = profils.map((profil) => __awaiter(this, void 0, void 0, function* () {
                const devices = yield this.getDevices(profil.id);
                const itemsPromises = devices.map((device) => __awaiter(this, void 0, void 0, function* () {
                    device['itemList'] = yield this.getItemsList(device.id);
                    return device;
                }));
                profil['devices'] = yield Promise.all(itemsPromises);
                return profil;
            }));
            el['profils'] = yield Promise.all(profilPromises);
            return el;
        }));
        return Promise.all(promises);
    }
    static getItemIO(nodeId) {
        const inputsPromises = this.getItemInputs(nodeId);
        const outputsPromises = this.getItemOutputs(nodeId);
        console.log(inputsPromises, outputsPromises);
        return Promise.all([inputsPromises, outputsPromises]).then((result) => {
            // console.log("[input, output]", result);
            const children = utilities_1.default._flatten(result);
            const promises = children.map((child) => __awaiter(this, void 0, void 0, function* () {
                const realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(child.id);
                const attributes = yield spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.getAttributesByCategory(realNode, constants_2.ATTRIBUTE_CATEGORY);
                // console.log("attributes", attributes)
                const obj = {
                    nodeId: child.id
                };
                attributes.forEach(el => {
                    obj[el.label.get()] = el.value.get();
                });
                return obj;
            }));
            return Promise.all(promises).then((res) => {
                return res;
                // return result.flat();
            });
        });
    }
    static getProfilBacnetValues(profilId, profilContextId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof profilContextId === "undefined" || profilContextId.trim().length === 0) {
                let realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(profilId);
                if (!realNode)
                    return;
                const contextIds = realNode.getContextIds();
                profilContextId = contextIds.find(id => {
                    let info = spinal_env_viewer_graph_service_1.SpinalGraphService.getInfo(id);
                    return info && info.type.get() === this.DEVICE_PROFILE_CONTEXT;
                });
            }
            if (!profilContextId)
                return;
            const bacnetValues = yield spinal_env_viewer_graph_service_1.SpinalGraphService.findInContext(profilId, profilContextId, (node) => {
                if (this.BACNET_VALUES_TYPE.indexOf(node.getType().get()) !== -1) {
                    spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
                    return true;
                }
                return false;
            });
            return bacnetValues.map(el => el.get());
        });
    }
    static getBacnetValuesMap(profilId) {
        return __awaiter(this, void 0, void 0, function* () {
            const bimDeviceMap = new Map();
            const attrs = yield this.getProfilBacnetValues(profilId);
            for (const attr of attrs) {
                bimDeviceMap.set((parseInt(attr.IDX) + 1), attr);
            }
            return bimDeviceMap;
        });
    }
}
exports.default = DeviceProfileUtilities;
exports.DeviceProfileUtilities = DeviceProfileUtilities;
DeviceProfileUtilities.DEVICE_PROFILE_CONTEXT = "deviceProfileContext";
DeviceProfileUtilities.ITEM_LIST_RELATION = "hasItemList";
DeviceProfileUtilities.ITEM_LIST_TO_ITEMS_RELATION = "hasItem";
DeviceProfileUtilities.INPUTS_RELATION = "hasInputs";
DeviceProfileUtilities.INPUT_RELATION = "hasInput";
DeviceProfileUtilities.OUTPUTS_RELATION = "hasOutputs";
DeviceProfileUtilities.OUTPUT_RELATION = "hasOutput";
DeviceProfileUtilities.PROFIL_TO_BACNET_RELATION = "hasBacnetValues";
DeviceProfileUtilities.ANALOG_VALUE_RELATION = "hasAnalogValues";
DeviceProfileUtilities.MULTISTATE_VALUE_RELATION = "hasMultiStateValues";
DeviceProfileUtilities.BINARY_VALUE_RELATION = "hasBinaryValues";
DeviceProfileUtilities.BACNET_VALUES_TYPE = ["networkValue", "binaryValue", "analogValue", "multiStateValue"];
//# sourceMappingURL=DeviceProfileUtilities.js.map