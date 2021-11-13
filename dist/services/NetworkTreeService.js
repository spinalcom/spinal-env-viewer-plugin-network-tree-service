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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const constants_1 = require("../data/constants");
const Constants_1 = require("spinal-env-viewer-plugin-forge/dist/Constants");
const _ = require("lodash");
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
// const spinalForgeViewer = new SpinalForgeViewer();
const g_win = typeof window === "undefined" ? global : window;
const bimObjectService = g_win.spinal.BimObjectService;
class NetworkTreeService {
    static createNetworkContext(name) {
        return spinal_env_viewer_graph_service_1.SpinalGraphService.addContext(name, constants_1.CONTEXT_TYPE);
    }
    static addNetwork(name, parentId, contextId) {
        let network = spinal_env_viewer_graph_service_1.SpinalGraphService.createNode({
            name,
            type: constants_1.NETWORK_TYPE
        }, new spinal_core_connectorjs_type_1.Model());
        return spinal_env_viewer_graph_service_1.SpinalGraphService.addChildInContext(parentId, network, contextId, constants_1.NETWORK_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
    }
    static addBimObject(contextId, parentId, bimObjectList) {
        const promises = [];
        for (let idx = 0; idx < bimObjectList.length; idx++) {
            const { model, selection } = bimObjectList[idx];
            model.getBulkProperties(selection, {
                propFilter: ['name']
            }, (el) => {
                el.forEach(element => {
                    bimObjectService.createBIMObject(element.dbId, element.name, model).then(bimObject => {
                        let BimObjectId = bimObject.info ? bimObject.info.id.get() : bimObject.id.get();
                        promises.push(spinal_env_viewer_graph_service_1.SpinalGraphService.addChildInContext(parentId, BimObjectId, contextId, constants_1.NETWORK_BIMOJECT_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE));
                    });
                });
            });
        }
        return Promise.all(promises);
    }
    static getBimObjectsLinked(nodeId) {
        return spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(nodeId, [constants_1.NETWORK_BIMOJECT_RELATION]);
    }
    static getNetworkTreeBimObjects(contextId) {
        return spinal_env_viewer_graph_service_1.SpinalGraphService.findNodes(contextId, [constants_1.NETWORK_RELATION, constants_1.NETWORK_BIMOJECT_RELATION], (node) => {
            return node.getType().get() === Constants_1.BIM_OBJECT_TYPE;
        });
    }
    static getNetworkGroups(bimObjectId) {
        let realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(bimObjectId);
        if (!realNode)
            return Promise.resolve([]);
        return realNode.getParents().then(parents => {
            parents = parents.filter(el => typeof el !== "undefined");
            let groups = parents.filter(el => {
                return el.getType().get() === constants_1.NETWORK_TYPE;
            });
            return groups.map(el => el.info.get());
        });
    }
    static getNetworkBimObjectParents(bimObjectId) {
        let realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(bimObjectId);
        if (!realNode)
            return Promise.resolve([]);
        return realNode.getParents([constants_1.NETWORK_BIMOJECT_RELATION, constants_1.NETWORK_RELATION]).then(argParents => {
            let promises = argParents.map((el) => __awaiter(this, void 0, void 0, function* () {
                if (el && el.getType().get() === Constants_1.BIM_OBJECT_TYPE)
                    return el.info.get();
                let p = yield this.getNetworkBimObjectParents(el ? el.info.id.get() : "");
                return p;
            }));
            return Promise.all(promises).then(parents => {
                return _.flattenDeep(parents).filter(el => typeof el !== "undefined");
            });
        });
    }
}
exports.default = NetworkTreeService;
exports.NetworkTreeService = NetworkTreeService;
//# sourceMappingURL=NetworkTreeService.js.map