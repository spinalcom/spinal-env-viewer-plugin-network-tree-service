import { IDataFormated, INodeInfoOBJ } from "../data/Interfaces";
export default class LinkNetworkTreeService {
    constructor();
    static createMaps(physicalAutomates: Array<INodeInfoOBJ>, virtualAutomates: Array<INodeInfoOBJ>): Promise<Map<string, IDataFormated>>;
    static linkNodes(resultMaps: Map<string, IDataFormated>, deviceProfilId: string): Promise<Array<boolean>>;
    static linkProfilToDevice(automateId: string, deviceProfilId: string, itemsValids: Array<{
        automateItem: INodeInfoOBJ;
        profileItem: INodeInfoOBJ;
    }>): Promise<boolean | Array<boolean>>;
    static linkAutomateItemToProfilItem(automateItemId: string, profilItemId: string): Promise<boolean>;
    static getProfilLinked(automateId: string): Promise<string>;
    static unLinkDeviceToProfil(automateId: string, argProfilId: string): Promise<boolean | Array<boolean>>;
    static unLinkAutomateItemToProfilItem(automateItemId: string, profilItemId?: string): Promise<boolean | Array<boolean>>;
    static getDeviceAndProfilData(automateId: string): Promise<IDataFormated>;
    static _getFormatedValues(automateInfo: INodeInfoOBJ, virtualAutomates: Array<INodeInfoOBJ>): Promise<IDataFormated>;
    static _getAutomateItems(automateId: string): Promise<Array<INodeInfoOBJ>>;
    static _formatVirtualAutomates(virtualAutomates: Array<INodeInfoOBJ>): Promise<INodeInfoOBJ[]>;
    static _getNamingConvention(nodeId: string, categoryName: string): Promise<string>;
    static _createRelationBetweenNodes(automateId: string, deviceProfilId: string, itemsValids: Array<{
        automateItem: INodeInfoOBJ;
        profileItem: INodeInfoOBJ;
    }>): Promise<boolean | Array<boolean>>;
    static _waitForEach(automateItems: Array<INodeInfoOBJ>, argProfilItems: Array<INodeInfoOBJ>, res: IDataFormated): Promise<INodeInfoOBJ[]>;
}
export { LinkNetworkTreeService };
