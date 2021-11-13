import { INodeRefObj } from "./INodeRefObj";
export interface IResult {
    validItems: Array<any>;
    invalidItems: Array<any>;
}
export interface IResultClassed {
    valids: Array<{
        automateItem: INodeRefObj;
        profileItem: INodeRefObj;
    }>;
    invalidAutomateItems: Array<INodeRefObj>;
    invalidProfileItems: Array<INodeRefObj>;
    automate: INodeRefObj;
}
