import { IForgeProperty } from "./IForgeProperty";
export interface IProperty {
    model: any;
    dbId: number;
    property?: IForgeProperty;
    namingConvention?: any;
    externalId?: string;
}
