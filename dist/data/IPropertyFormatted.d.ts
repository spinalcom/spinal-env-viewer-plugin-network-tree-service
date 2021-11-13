import { IForgeProperty } from "./IForgeProperty";
export interface IPropertyFormatted {
    id: number | string;
    model: any;
    name?: string;
    property?: IForgeProperty;
    isAutomate?: boolean;
    color?: string;
    parentId?: string | number;
    children?: Array<IPropertyFormatted>;
    namingConvention?: any;
    externalId?: string;
    dbId?: number;
}
