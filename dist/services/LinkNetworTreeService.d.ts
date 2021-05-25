import { IDataFormated, INodeInfoOBJ } from "../data/Interfaces";
export default class LinkNetworkTreeService {
    static createMaps(physicalAutomates: Array<INodeInfoOBJ>, virtualAutomates: Array<INodeInfoOBJ>): Promise<Map<string, IDataFormated>>;
    static linkNodes(resultMaps: Map<string, IDataFormated>, deviceProfilId: string): Promise<Array<boolean>>;
    static linkProfilToDevice(automateId: string, deviceProfilId: string, itemsValids: Array<{
        automateItem: INodeInfoOBJ;
        profileItem: INodeInfoOBJ;
    }>): Promise<boolean | Array<boolean>>;
    static unLinkDeviceToProfil(automateId: string, argProfilId: string): Promise<boolean | Array<boolean>>;
    static linkAutomateItemToProfilItem(automateItemId: string, profilItemId: string): Promise<boolean>;
    static getProfilLinked(automateId: string): Promise<string>;
    static unLinkAutomateItemToProfilItem(automateItemId: string, profilItemId?: string): Promise<boolean | Array<boolean>>;
    static getDeviceAndProfilData(automateId: string): Promise<IDataFormated>;
    private static _getAutomateItems;
    private static _getFormatedValues;
    private static _createRelationBetweenNodes;
    private static _waitForEach;
}
export { LinkNetworkTreeService };
