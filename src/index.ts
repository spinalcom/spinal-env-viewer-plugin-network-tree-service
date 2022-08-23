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

import { GenerateNetworkTreeService } from "./services/GenerateNetworkTreeService";
import { LinkBmsDeviceService } from "./services/LinkBmsDevicesService";
import { LinkNetworkTreeService } from "./services/LinkNetworkTreeService";
import { NetworkTreeService } from "./services/NetworkTreeService";
import { DeviceProfileUtilities } from "./utilities/DeviceProfileUtilities";
import { AttributesUtilities } from "./utilities/AttributesUtilities";
import { CONTEXT_TYPE, NETWORK_TYPE, NETWORK_RELATION, PLC_ATTR, OBJECT_ATTR, ATTRIBUTE_CATEGORY, NETWORK_BIMOJECT_RELATION, AUTOMATES_TO_PROFILE_RELATION, OBJECT_TO_BACNET_ITEM_RELATION } from "./data/constants";

const CONSTANTS = {
   CONTEXT_TYPE,
   NETWORK_TYPE,
   NETWORK_RELATION,
   PLC_ATTR,
   OBJECT_ATTR,
   ATTRIBUTE_CATEGORY,
   NETWORK_BIMOJECT_RELATION,
   AUTOMATES_TO_PROFILE_RELATION,
   OBJECT_TO_BACNET_ITEM_RELATION
}

const gRoot: any = typeof window === 'undefined' ? global : window;
if (typeof gRoot.spinal === 'undefined') gRoot.spinal = {};

if (typeof gRoot.spinal.DeviceProfileUtilities === 'undefined') {
  gRoot.spinal.DeviceProfileUtilities = DeviceProfileUtilities;
}

const generateNetworkTreeService: GenerateNetworkTreeService = GenerateNetworkTreeService;
const linkBmsDeviceService: LinkBmsDeviceService = LinkBmsDeviceService;
const linkNetworkTreeService: LinkNetworkTreeService = LinkNetworkTreeService;
const networkTreeService: NetworkTreeService = NetworkTreeService;
const deviceProfileUtilities: DeviceProfileUtilities = DeviceProfileUtilities;
const attributesUtilities: AttributesUtilities = AttributesUtilities;


export {
   CONSTANTS,
   GenerateNetworkTreeService,
   LinkBmsDeviceService,
   LinkNetworkTreeService,
   NetworkTreeService,
   AttributesUtilities,
   DeviceProfileUtilities,
   generateNetworkTreeService,
   linkBmsDeviceService,
   linkNetworkTreeService,
   networkTreeService,
   attributesUtilities,
   deviceProfileUtilities
}