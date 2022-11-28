import { IAggregateSelection } from "../data/IAggregateSelection";
import { IForgeProperty } from "../data/IForgeProperty";
import { IAttribute } from "../data/IBmsConfig";
export default abstract class AttributesUtilities {
    static getRevitAttributes(items: IAggregateSelection | IAggregateSelection[]): Promise<Array<{
        model: any;
        properties: {
            [key: string]: any;
        };
    }>>;
    static getSpinalAttributes(nodeId: string): Promise<Array<{
        [key: string]: any;
        attributes: Array<{
            label: string;
            value: any;
            categoryName: string;
        }>;
    }>>;
    static findRevitAttribute(model: any, dbid: number, attribute: string | IAttribute): Promise<IForgeProperty>;
    static findSpinalAttribute(model: any, dbid: number, attribute: string | IAttribute, nodeId?: string): Promise<IForgeProperty>;
    static findSpinalAttributeById(nodeId: string, attribute: string | IAttribute): Promise<IForgeProperty>;
    static findAttribute(model: any, dbid: number, attributeName: string | IAttribute, nodeId?: string): Promise<IForgeProperty>;
}
export { AttributesUtilities };
