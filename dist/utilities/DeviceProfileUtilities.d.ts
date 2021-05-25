export default class DeviceProfileUtilities {
    static DEVICE_PROFILE_CONTEXT: string;
    static ITEM_LIST_RELATION: string;
    static ITEM_LIST_TO_ITEMS_RELATION: string;
    static INPUTS_RELATION: string;
    static INPUT_RELATION: string;
    static OUTPUTS_RELATION: string;
    static OUTPUT_RELATION: string;
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
    static getInputOutputMap(profilId: string): Promise<Map<number, any>>;
}
export { DeviceProfileUtilities };
