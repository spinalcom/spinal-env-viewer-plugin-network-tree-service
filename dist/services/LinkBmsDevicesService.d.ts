import { INodeRefObj } from "../data/INodeRefObj";
import { IBmsConfig, IBimDeviceConfig, IAttribute } from "../data/IBmsConfig";
export default abstract class LinkBmsDeviceService {
    static LinkBmsDeviceToBimDevicesUsingAttribute(bmsDeviceOpt: IBmsConfig, bimDeviceOpt: IBimDeviceConfig): Promise<boolean>;
    static LinkBmsDeviceToBimDevices(bmsContextId: string, bmsDeviceId: string, bimDeviceId: string): Promise<void>;
    static unLinkBmsDeviceToBimDevices(bmsContextId: string, bmsDeviceId: string, bimDeviceId: string, argProfilId?: string, bimDeviceMap?: Map<number, any>): Promise<void>;
    static linkProfilToBmsDevice(bmsContextId: string, bmsDeviceId: string, profilId: string): Promise<boolean>;
    static unLinkProfilToBmsDevice(bmsContextId: string, bmsDeviceId: string): Promise<boolean>;
    static getBmsEndpointsMap(bmsContextId: string, bmsDeviceId: string, attribute?: string | IAttribute): Promise<Map<number, INodeRefObj>>;
    static getBimAutomateMap(automateId: string, model: any, attribute: string | IAttribute): Promise<Map<any, any>>;
    private static bmsDevicehasBimDevice;
    static getBacnetProfilLinked(nodeId: string): Promise<string>;
    private static _linkTwoMaps;
    private static _unLinkTwoMaps;
    private static _createOrRemoveRelation;
}
export { LinkBmsDeviceService };
