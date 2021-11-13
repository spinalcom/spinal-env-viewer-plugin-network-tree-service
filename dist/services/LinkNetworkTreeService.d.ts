import { SpinalNodeRef } from 'spinal-env-viewer-graph-service';
import { IResultClassed } from "../data/IResult";
import { INodeRefObj } from "../data/INodeRefObj";
export default abstract class LinkNetworkTreeService {
    static createMaps(automateBims: Array<INodeRefObj>, profilItems: Array<INodeRefObj>): Promise<Map<string, IResultClassed>>;
    static linkNodes(resultMaps: Map<string, IResultClassed>, deviceProfilId: string): Promise<Array<boolean>>;
    static linkProfilToDevice(automateId: string, deviceProfilId: string, itemsValids: Array<{
        automateItem: INodeRefObj;
        profileItem: INodeRefObj;
    }>): Promise<boolean | Array<boolean>>;
    static linkAutomateItemToProfilItem(automateItemId: string, profilItemId: string): Promise<boolean>;
    static getProfilLinked(automateId: string): Promise<string>;
    static unLinkDeviceToProfil(automateId: string, argProfilId: string): Promise<boolean | Array<boolean>>;
    static unLinkAutomateItemToProfilItem(automateItemId: string, profilItemId?: string): Promise<boolean | Array<boolean>>;
    static getDeviceAndProfilData(automateId: string): Promise<IResultClassed>;
    static _getFormatedValues(automateInfo: INodeRefObj, virtualAutomates: Array<INodeRefObj>): Promise<IResultClassed>;
    static _getAutomateItems(automateId: string): Promise<Array<INodeRefObj>>;
    static _formatVirtualAutomates(profilItems: Array<INodeRefObj>): Promise<INodeRefObj[]>;
    static _getNamingConvention(nodeId: string, categoryName: string): Promise<string>;
    static _createRelationBetweenNodes(automateId: string, deviceProfilId: string, itemsValids: Array<{
        automateItem: INodeRefObj;
        profileItem: INodeRefObj;
    }>): Promise<boolean | Array<boolean>>;
    static _waitForEach(automateItems: Array<INodeRefObj>, argProfilItems: Array<INodeRefObj>, res: IResultClassed): Promise<INodeRefObj[]>;
    static getBmsDeviceWithTheSameProfil(bimDeviceId: string, profilId: string): Promise<SpinalNodeRef[]>;
    static getBmsDeviceContextId(nodeRef: SpinalNodeRef): string;
}
export { LinkNetworkTreeService };
