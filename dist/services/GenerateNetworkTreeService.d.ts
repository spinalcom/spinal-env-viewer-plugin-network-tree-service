import "spinal-env-viewer-plugin-forge";
import { SpinalNode } from "spinal-env-viewer-graph-service";
import { INodeInfoOBJ } from "../data/Interfaces";
export default class GenerateNetworkTreeService {
    static getElementProperties(items: {
        model: any;
        selection: number[];
    } | Array<{
        model: any;
        selection: number[];
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
    static createTree(automates: Array<{
        model: any;
        dbId: number;
        property: {
            attributeName?: string;
            displayCategory?: string;
            displayName?: string;
            displayValue?: string;
        };
    }>, equipments: Array<{
        model: any;
        dbId: number;
        property: {
            attributeName?: string;
            displayCategory?: string;
            displayName?: string;
            displayValue?: string;
        };
    }>, config: any): Promise<{
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
    static _createNodes(contextId: string, node: {
        namingConvention: string;
        children: Array<any>;
        name?: string;
        dbId: number | string;
        model: any;
        color: string;
        isAutomate: boolean;
        externalId?: string;
    }, parentId: string): Promise<SpinalNode<any> | Array<any>>;
    private static _getItemPropertiesFormatted;
    private static _getBimObjectName;
    private static _getTreeArray;
    private static _formatAutomateAttribute;
    private static _formatEquipmentAttribute;
    private static _formatItem;
    private static _createBimObjectNode;
    private static _TransformArrayToTree;
    private static _generateRandomColor;
    private static getElementAut;
    private static _getNamingConvention;
    private static _addSpinalAttribute;
}
export { GenerateNetworkTreeService };
