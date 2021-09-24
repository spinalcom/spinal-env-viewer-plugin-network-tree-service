export default class DeviceProfileUtilities {
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
    static profilsMaps: Map<string, Map<number, any>>;
    static getDevicesContexts(): Array<{
        name: string;
        type: string;
        id: string;
    }>;
    static getDeviceProfiles(contextId: string): Promise<Array<{
        name: string;
        type: string;
        id: string;
    }>>;
    static getDevices(profilId: string): Promise<Array<{
        name: string;
        type: string;
        id: string;
    }>>;
    static getItemsList(deviceId: string): Promise<Array<{
        name: string;
        type: string;
        id: string;
    }>>;
    static getItemInputs(itemId: string): Promise<Array<{
        name: string;
        type: string;
        id: string;
    }>>;
    static getItemOutputs(itemId: string): Promise<Array<{
        name: string;
        type: string;
        id: string;
    }>>;
    static getDeviceContextTreeStructure(): Promise<Array<{
        name: string;
        type: string;
        id: string;
    }>>;
    static getItemIO(nodeId: string): Promise<any>;
    static getMeasures(nodeId: string): Promise<any>;
    static getProfilBacnetValues(profilId: string, profilContextId?: string): Promise<any>;
    static getBacnetValuesMap(profilId: string): Promise<Map<any, any>>;
    static _getBacnetObjectType(type: any): any;
}
export { DeviceProfileUtilities };
