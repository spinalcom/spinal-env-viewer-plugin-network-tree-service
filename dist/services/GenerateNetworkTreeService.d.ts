import "spinal-env-viewer-plugin-forge";
import { SpinalNode } from "spinal-env-viewer-graph-service";
import { INamingConventionConfig } from "../data/INamingConvention";
import { IAggregateSelection } from "../data/IAggregateSelection";
import { INodeRefObj } from "../data/INodeRefObj";
import { IResult } from "../data/IResult";
import { IProperty } from "../data/IProperty";
import { IPropertyFormatted } from "../data/IPropertyFormatted";
import { IAttributeConfig } from "../data/IAttributeConfig";
export default abstract class GenerateNetworkTreeService {
    static getElementProperties(items: IAggregateSelection | Array<IAggregateSelection>, attributeName: string, namingConventionConfig: INamingConventionConfig): Promise<IResult>;
    static createTree(automates: Array<IProperty>, equipments: Array<IProperty>, attrConfig: IAttributeConfig): Promise<{
        tree: IPropertyFormatted[];
        invalids: IPropertyFormatted[];
        valids: IPropertyFormatted[];
    }>;
    static createTreeNodes(contextId: string, nodeId: string, tree: Array<{
        children: Array<INodeRefObj>;
    }>, dontCreateEmptyAutomate?: boolean): Promise<SpinalNode<any>[]>;
    static classifyDbIdsByModel(items: Array<{
        model: any;
        dbId: number;
    }>): Array<{
        model: any;
        ids: Array<number>;
    }>;
    static _createNodes(contextId: string, node: IPropertyFormatted, parentNodeId: string): Promise<SpinalNode<any> | SpinalNode<any>[]>;
    private static _getItemPropertiesFormatted;
    private static _getTreeArray;
    private static _formatAutomateAttribute;
    private static _formatEquipmentAttribute;
    private static _formatItem;
    private static _createBimObjectNode;
    private static _getBimObjectName;
    private static _TransformArrayToTree;
    private static _generateRandomColor;
    private static getElementAut;
    private static _getNamingConvention;
    private static _addSpinalAttribute;
}
export { GenerateNetworkTreeService };
