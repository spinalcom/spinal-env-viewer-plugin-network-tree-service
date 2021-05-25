import { GenerateNetworkTree } from "./services/GenerateNetworkTree";
import { LinkBmsDevice } from "./services/LinkBmsDevices";
import { LinkNetworkTreeService } from "./services/LinkNetworTreeService";
import { NetworkTreeService } from "./services/NetworkTreeService";
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

const generateNetworkTree: GenerateNetworkTree = GenerateNetworkTree;
const linkBmsDevice: LinkBmsDevice = LinkBmsDevice;
const linkNetworkTreeService: LinkNetworkTreeService = LinkNetworkTreeService;
const networkTreeService: NetworkTreeService = NetworkTreeService;



export {
   CONSTANTS,
   GenerateNetworkTree,
   LinkBmsDevice,
   LinkNetworkTreeService,
   NetworkTreeService,
   generateNetworkTree,
   linkBmsDevice,
   linkNetworkTreeService,
   networkTreeService
}