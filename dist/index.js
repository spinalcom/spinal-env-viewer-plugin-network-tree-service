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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceProfileUtilities = exports.attributesUtilities = exports.networkTreeService = exports.linkNetworkTreeService = exports.linkBmsDeviceService = exports.generateNetworkTreeService = exports.DeviceProfileUtilities = exports.AttributesUtilities = exports.NetworkTreeService = exports.LinkNetworkTreeService = exports.LinkBmsDeviceService = exports.GenerateNetworkTreeService = exports.CONSTANTS = void 0;
const GenerateNetworkTreeService_1 = require("./services/GenerateNetworkTreeService");
Object.defineProperty(exports, "GenerateNetworkTreeService", { enumerable: true, get: function () { return GenerateNetworkTreeService_1.GenerateNetworkTreeService; } });
const LinkBmsDevicesService_1 = require("./services/LinkBmsDevicesService");
Object.defineProperty(exports, "LinkBmsDeviceService", { enumerable: true, get: function () { return LinkBmsDevicesService_1.LinkBmsDeviceService; } });
const LinkNetworkTreeService_1 = require("./services/LinkNetworkTreeService");
Object.defineProperty(exports, "LinkNetworkTreeService", { enumerable: true, get: function () { return LinkNetworkTreeService_1.LinkNetworkTreeService; } });
const NetworkTreeService_1 = require("./services/NetworkTreeService");
Object.defineProperty(exports, "NetworkTreeService", { enumerable: true, get: function () { return NetworkTreeService_1.NetworkTreeService; } });
const DeviceProfileUtilities_1 = require("./utilities/DeviceProfileUtilities");
Object.defineProperty(exports, "DeviceProfileUtilities", { enumerable: true, get: function () { return DeviceProfileUtilities_1.DeviceProfileUtilities; } });
const AttributesUtilities_1 = require("./utilities/AttributesUtilities");
Object.defineProperty(exports, "AttributesUtilities", { enumerable: true, get: function () { return AttributesUtilities_1.AttributesUtilities; } });
const constants_1 = require("./data/constants");
const CONSTANTS = {
    CONTEXT_TYPE: constants_1.CONTEXT_TYPE,
    NETWORK_TYPE: constants_1.NETWORK_TYPE,
    NETWORK_RELATION: constants_1.NETWORK_RELATION,
    PLC_ATTR: constants_1.PLC_ATTR,
    OBJECT_ATTR: constants_1.OBJECT_ATTR,
    ATTRIBUTE_CATEGORY: constants_1.ATTRIBUTE_CATEGORY,
    NETWORK_BIMOJECT_RELATION: constants_1.NETWORK_BIMOJECT_RELATION,
    AUTOMATES_TO_PROFILE_RELATION: constants_1.AUTOMATES_TO_PROFILE_RELATION,
    OBJECT_TO_BACNET_ITEM_RELATION: constants_1.OBJECT_TO_BACNET_ITEM_RELATION
};
exports.CONSTANTS = CONSTANTS;
const gRoot = typeof window === 'undefined' ? global : window;
if (typeof gRoot.spinal === 'undefined')
    gRoot.spinal = {};
if (typeof gRoot.spinal.DeviceProfileUtilities === 'undefined') {
    gRoot.spinal.DeviceProfileUtilities = DeviceProfileUtilities_1.DeviceProfileUtilities;
}
const generateNetworkTreeService = GenerateNetworkTreeService_1.GenerateNetworkTreeService;
exports.generateNetworkTreeService = generateNetworkTreeService;
const linkBmsDeviceService = LinkBmsDevicesService_1.LinkBmsDeviceService;
exports.linkBmsDeviceService = linkBmsDeviceService;
const linkNetworkTreeService = LinkNetworkTreeService_1.LinkNetworkTreeService;
exports.linkNetworkTreeService = linkNetworkTreeService;
const networkTreeService = NetworkTreeService_1.NetworkTreeService;
exports.networkTreeService = networkTreeService;
const deviceProfileUtilities = DeviceProfileUtilities_1.DeviceProfileUtilities;
exports.deviceProfileUtilities = deviceProfileUtilities;
const attributesUtilities = AttributesUtilities_1.AttributesUtilities;
exports.attributesUtilities = attributesUtilities;
//# sourceMappingURL=index.js.map