export interface IAttribute {
    categoryName?: string;
    attributeName: string;
}
export interface IBmsConfig {
    contextId: string;
    deviceId: string;
    attribute: IAttribute;
}
export interface IBimDeviceConfig {
    nodeId: string;
    dbId?: string;
    model?: any;
    attribute: IAttribute;
}
