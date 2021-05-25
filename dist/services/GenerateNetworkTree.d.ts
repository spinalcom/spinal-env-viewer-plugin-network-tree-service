import { INodeInfoOBJ } from "../data/Interfaces";
export default class GenerateNetworkTree {
    static getElementProperties(items: {
        model: any;
        selection: Number[];
    } | Array<{
        model: any;
        selection: Number[];
    }>, attributeName: string, namingConventionConfig: {
        attributeName: string;
        useAttrValue: boolean;
        personalized: {
            callback: Function;
        };
    }): Promise<{
        validItems: Array<any>;
        invalidItems: Array<any>;
    }>;
    static createTree(automates: any, equipments: any, config: any): Promise<{
        tree: Array<any>;
        invalids: Array<any>;
        valids: Array<any>;
    }>;
    static createTreeNodes(contextId: string, nodeId: string, tree: Array<{
        children: Array<INodeInfoOBJ>;
    }>, dontCreateEmptyAutomate?: boolean): Promise<any>;
    static classifyDbIdsByModel(items: Array<{
        model: any;
        dbId: number;
    }>): Array<{
        model: any;
        ids: Array<number>;
    }>;
    private static _getItemPropertiesFormatted;
    private static _getBimObjectName;
    private static _getAttributeByName;
    private static _getTreeArray;
    private static _formatAutomateAttribute;
    private static _formatEquipmentAttribute;
    private static _formatItem;
    private static _createBimObjectNode;
    private static _createNodes;
    private static _TransformArrayToTree;
    private static _generateRandomColor;
    private static getElementAut;
    private static _getNamingConvention;
    private static _getpropertyValue;
    private static _addSpinalAttribute;
}
export { GenerateNetworkTree };
