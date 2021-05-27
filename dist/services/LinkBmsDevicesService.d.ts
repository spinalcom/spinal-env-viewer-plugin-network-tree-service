import { INodeInfoOBJ } from "../data/Interfaces";
export default class LinkBmsDeviceService {
    static LinkBmsDeviceToBimDevices(bmsContextId: string, bmsDeviceId: string, bimDeviceId: string): Promise<void>;
    static unLinkBmsDeviceToBimDevices(bmsContextId: string, bmsDeviceId: string, bimDeviceId: string): Promise<void>;
    static linkProfilToBmsDevice(bmsContextId: string, bmsDeviceId: string, profilId: string): Promise<void>;
    static unLinkProfilToBmsDevice(bmsContextId: string, bmsDeviceId: string): Promise<boolean>;
    static getEndpointsMap(bmsContextId: string, bmsDeviceId: string): Promise<Map<number, INodeInfoOBJ>>;
    static _getBacnetProfilLinked(bimDeviceId: string): Promise<string>;
    private static _getAutomateItems;
    private static bmsDevicehasBimDevice;
}
export { LinkBmsDeviceService };
