import "spinal-env-viewer-plugin-forge";
import { SpinalContext, SpinalNode } from 'spinal-env-viewer-graph-service';
import { INodeRefObj } from "../data/INodeRefObj";
import { IAggregateSelection } from "../data/IAggregateSelection";
export default abstract class NetworkTreeService {
    static createNetworkContext(name: string): Promise<SpinalContext<any>>;
    static addNetwork(name: string, parentId: string, contextId: string): Promise<SpinalNode<any>>;
    static addBimObject(contextId: string, parentId: string, bimObjectList: IAggregateSelection[]): Promise<SpinalNode<any>[]>;
    static getBimObjectsLinked(nodeId: string): Promise<spinal.Model[]>;
    static getNetworkTreeBimObjects(contextId: string): Promise<SpinalNode<any>[]>;
    static getNetworkGroups(bimObjectId: string): Promise<Array<INodeRefObj>>;
    static getNetworkBimObjectParents(bimObjectId: string): Promise<Array<INodeRefObj>>;
}
export { NetworkTreeService };
