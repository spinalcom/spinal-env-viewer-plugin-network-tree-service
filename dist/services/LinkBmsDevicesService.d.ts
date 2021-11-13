import { INodeRefObj } from "../data/INodeRefObj";
export default abstract class LinkBmsDeviceService {
    static LinkBmsDeviceToBimDevices(bmsContextId: string, bmsDeviceId: string, bimDeviceId: string): Promise<void>;
    static unLinkBmsDeviceToBimDevices(bmsContextId: string, bmsDeviceId: string, bimDeviceId: string): Promise<void>;
    static linkProfilToBmsDevice(bmsContextId: string, bmsDeviceId: string, profilId: string): Promise<boolean>;
    static unLinkProfilToBmsDevice(bmsContextId: string, bmsDeviceId: string): Promise<boolean>;
    static getBmsEndpointsMap(bmsContextId: string, bmsDeviceId: string): Promise<Map<number, INodeRefObj>>;
    private static bmsDevicehasBimDevice;
    static getBacnetProfilLinked(nodeId: string): Promise<string>;
    private static _getAutomateItems;
    private static _linkTwoMaps;
    private static _unLinkTwoMaps;
}
export { LinkBmsDeviceService };
