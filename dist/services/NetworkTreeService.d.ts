import "spinal-env-viewer-plugin-forge";
import { SpinalContext, SpinalNode } from 'spinal-env-viewer-graph-service';
import { INodeInfoOBJ } from "../data/Interfaces";
export default class NetworkTreeService {
    static createNetworkContext(name: string): Promise<SpinalContext<any>>;
    static addNetwork(name: string, parentId: string, contextId: string): Promise<SpinalNode<any>>;
    static addBimObject(contextId: string, parentId: string, bimObjectList: Array<{
        model: any;
        selection: Array<number>;
    }>): Promise<Array<SpinalNode<any>>>;
    static getBimObjectsLinked(nodeId: string): Promise<Array<spinal.Model>>;
    static getNetworkTreeBimObjects(contextId: string): Promise<Array<SpinalNode<any>>>;
    static getNetworkGroups(bimObjectId: string): Promise<Array<INodeInfoOBJ>>;
    static getNetworkBimObjectParents(bimObjectId: string): Promise<Array<INodeInfoOBJ>>;
}
export { NetworkTreeService };
