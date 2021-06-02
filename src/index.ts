import { GenerateNetworkTreeService } from "./services/GenerateNetworkTreeService";
import { LinkBmsDeviceService } from "./services/LinkBmsDevicesService";
import { LinkNetworkTreeService } from "./services/LinkNetworkTreeService";
import { NetworkTreeService } from "./services/NetworkTreeService";
import { CONTEXT_TYPE, NETWORK_TYPE, NETWORK_RELATION, PLC_ATTR, OBJECT_ATTR, ATTRIBUTE_CATEGORY, NETWORK_BIMOJECT_RELATION, AUTOMATES_TO_PROFILE_RELATION, OBJECT_TO_BACNET_ITEM_RELATION } from "./data/constants";
import { DeviceProfileUtilities } from "./utilities/DeviceProfileUtilities";
import { AttributesUtilities } from "./utilities/AttributesUtilities";

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