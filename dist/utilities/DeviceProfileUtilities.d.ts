import { INodeRefObj } from "../data/INodeRefObj";
export default abstract class DeviceProfileUtilities {
    static DEVICE_PROFILE_CONTEXT: string;
    static ITEM_LIST_RELATION: string;
    static ITEM_LIST_TO_ITEMS_RELATION: string;
    static INPUTS_RELATION: string;
    static INPUT_RELATION: string;
    static OUTPUTS_RELATION: string;
    static OUTPUT_RELATION: string;
    static PROFIL_TO_BACNET_RELATION: string;
    static ANALOG_VALUE_RELATION: string;
    static MULTISTATE_VALUE_RELATION: string;
    static BINARY_VALUE_RELATION: string;
    static ITEMS_TO_SUPERVISION: string;
    static SUPERVISION_TO_MEASURES: string;
    static MEASURE_TO_ITEMS: string;
    static BACNET_VALUES_TYPE: string[];
    static profilsMaps: Map<string, Map<string, INodeRefObj>>;
    static getDevicesContexts(): INodeRefObj[];
    static getDeviceProfiles(contextId: string): Promise<INodeRefObj[]>;
    static getDevices(profilId: string): Promise<INodeRefObj[]>;
    static getItemsList(deviceId: string): Promise<INodeRefObj[]>;
    static getItemInputs(itemId: string): Promise<INodeRefObj[]>;
    static getItemOutputs(itemId: string): Promise<INodeRefObj[]>;
    static getDeviceContextTreeStructure(): Promise<INodeRefObj[]>;
    static getItemIO(nodeId: string): Promise<{
        nodeId: string;
        [key: string]: any;
    }[]>;
    static getMeasures(nodeId: string): Promise<{
        nodeId: string;
        typeId: string | number;
        [key: string]: any;
    }[]>;
    static getProfilBacnetValues(profilId: string, profilContextId?: string): Promise<INodeRefObj[]>;
    static getBacnetValuesMap(profilId: string): Promise<Map<string, INodeRefObj>>;
    static _getBacnetObjectType(type: any): string | number;
    static getProfilContextId(profilId: string): string;
}
export { DeviceProfileUtilities };
