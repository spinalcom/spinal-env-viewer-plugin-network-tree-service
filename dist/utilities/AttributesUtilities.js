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
exports.AttributesUtilities = void 0;
const spinal_env_viewer_bim_manager_service_1 = require("spinal-env-viewer-bim-manager-service");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const _ = require("lodash");
const g_win = typeof window === "undefined" ? global : window;
const bimObjectService = g_win.spinal.BimObjectService;
class AttributesUtilities {
    static getRevitAttributes(items) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield spinal_env_viewer_bim_manager_service_1.bimObjectManagerService.getBimObjectProperties(items);
            return _.flattenDeep(data.map(el => {
                return el.properties;
            }));
        });
    }
    static getSpinalAttributes(nodeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const realNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(nodeId);
            if (typeof realNode === "undefined")
                throw new Error("realnode not found");
            const categories = yield spinal_env_viewer_plugin_documentation_service_1.serviceDocumentation.getCategory(realNode);
            const promises = categories.map((category) => __awaiter(this, void 0, void 0, function* () {
                const catInfo = category.node.info.get();
                catInfo.attributes = [];
                const attributes = yield category.node.getElement();
                for (let index = 0; index < attributes.length; index++) {
                    const element = attributes[index];
                    catInfo.attributes.push(element.get());
                }
                return catInfo;
            }));
            return Promise.all(promises);
        });
    }
    static findRevitAttribute(model, dbid, attributeName) {
        return __awaiter(this, void 0, void 0, function* () {
            const attributes = yield this.getRevitAttributes({ model, selection: [dbid] });
            const properties = attributes[0].properties;
            return properties.find(obj => {
                return (obj.displayName.toLowerCase() === attributeName.toLowerCase() || obj.attributeName.toLowerCase() === attributeName.toLowerCase()) && obj.displayValue.toLowerCase() && (obj.displayValue + "").length > 0;
            });
        });
    }
    static findSpinalAttribute(model, dbid, attributeName) {
        return __awaiter(this, void 0, void 0, function* () {
            const bimNode = yield bimObjectService.getBIMObject(dbid, model);
            if (typeof bimNode === "undefined")
                return;
            const nodeId = bimNode.id.get();
            const attributes = yield this.getSpinalAttributes(nodeId);
            for (const obj of attributes) {
                const found = obj.attributes.find(el => el.label.toLowerCase() === attributeName.toLowerCase());
                if (found) {
                    return {
                        categoryName: obj.name,
                        categoryId: obj.id,
                        displayName: found.label,
                        attributeName: found.label,
                        displayValue: found.value
                    };
                }
            }
        });
    }
    static findSpinalAttributeById(nodeId, attributeName) {
        return __awaiter(this, void 0, void 0, function* () {
            const bimNode = spinal_env_viewer_graph_service_1.SpinalGraphService.getInfo(nodeId);
            if (typeof bimNode === "undefined")
                return;
            // const nodeId = bimNode.id.get();
            const attributes = yield this.getSpinalAttributes(nodeId);
            for (const obj of attributes) {
                const found = obj.attributes.find(el => el.label.toLowerCase() === attributeName.toLowerCase());
                if (found) {
                    return {
                        categoryName: obj.name,
                        categoryId: obj.id,
                        displayName: found.label,
                        attributeName: found.label,
                        displayValue: found.value
                    };
                }
            }
        });
    }
    static findAttribute(model, dbid, attributeName) {
        return __awaiter(this, void 0, void 0, function* () {
            let attribute = yield this.findSpinalAttribute(model, dbid, attributeName);
            if (attribute)
                return attribute;
            return this.findRevitAttribute(model, dbid, attributeName);
        });
    }
}
exports.default = AttributesUtilities;
exports.AttributesUtilities = AttributesUtilities;
//# sourceMappingURL=AttributesUtilities.js.map