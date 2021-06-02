export default class AttributesUtilities {
    constructor();
    static getRevitAttributes(items: {
        model: any;
        selection: Number[];
    } | Array<{
        model: any;
        selection: Number[];
    }>): Promise<Array<{
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
    static findRevitAttribute(model: any, dbid: number, attributeName: string): Promise<{
        categoryName: string;
        displayName: string;
        attributeName: string;
        displayValue: string;
    }>;
    static findSpinalAttribute(model: any, dbid: number, attributeName: string): Promise<{
        categoryName: string;
        categoryId: string;
        displayName: string;
        attributeName: string;
        displayValue: string;
    }>;
    static findAttribute(model: any, dbid: number, attributeName: string): Promise<{
        categoryName: string;
        displayName: string;
        attributeName: string;
        displayValue: string;
    }>;
}
export { AttributesUtilities };
