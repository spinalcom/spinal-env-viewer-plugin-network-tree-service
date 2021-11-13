import { IAggregateSelection } from "../data/IAggregateSelection";
import { IForgeProperty } from "../data/IForgeProperty";
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
        }>;
    }>>;
    static findRevitAttribute(model: any, dbid: number, attributeName: string): Promise<IForgeProperty>;
    static findSpinalAttribute(model: any, dbid: number, attributeName: string): Promise<IForgeProperty>;
    static findSpinalAttributeById(nodeId: string, attributeName: string): Promise<IForgeProperty>;
    static findAttribute(model: any, dbid: number, attributeName: string): Promise<IForgeProperty>;
}
export { AttributesUtilities };
