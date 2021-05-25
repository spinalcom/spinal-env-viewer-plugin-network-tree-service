import { SpinalForgeViewer } from "spinal-env-viewer-plugin-forge";
import { SpinalContext, SpinalGraphService, SpinalNode, SPINAL_RELATION_PTR_LST_TYPE } from 'spinal-env-viewer-graph-service';
import { NETWORK_RELATION, CONTEXT_TYPE, NETWORK_TYPE, NETWORK_BIMOJECT_RELATION, AUTOMATES_TO_PROFILE_RELATION, OBJECT_TO_BACNET_ITEM_RELATION } from '../data/constants';
import { IDataFormated, INodeInfoOBJ } from "../data/Interfaces";
import { BIM_OBJECT_TYPE } from "spinal-env-viewer-plugin-forge/dist/Constants";

import Utilities from "../utilities/utilities";


const spinalForgeViewer = new SpinalForgeViewer();


export default class NetworkTreeService {

   public static createNetworkContext(name: string): Promise<SpinalContext<any>> {
      return SpinalGraphService.addContext(name, CONTEXT_TYPE);
   }

   public static addNetwork(name: string, parentId: string, contextId: string): Promise<SpinalNode<any>> {
      let network = SpinalGraphService.createNode({
         name,
         type: NETWORK_TYPE
      }, new spinal.Model())

      return SpinalGraphService.addChildInContext(parentId, network, contextId,
         NETWORK_RELATION,
         SPINAL_RELATION_PTR_LST_TYPE)

   }

   public static addBimObject(contextId: string, parentId: string, bimObjectList: Array<{ model: any, selection: Array<number> }>): Promise<Array<SpinalNode<any>>> {

      const promises = [];

      for (let idx = 0; idx < bimObjectList.length; idx++) {
         const { model, selection } = bimObjectList[idx];


         model.getBulkProperties(selection, {
            propFilter: ['name']
         }, (el) => {

            el.forEach(element => {
               spinalForgeViewer.bimObjectService.createBIMObject(element.dbId, element.name, model).then(bimObject => {
                  let BimObjectId = bimObject.info ? bimObject.info.id.get() : bimObject.id.get();

                  promises.push(SpinalGraphService.addChildInContext(parentId, BimObjectId, contextId, NETWORK_BIMOJECT_RELATION, SPINAL_RELATION_PTR_LST_TYPE));
               })

            });
         });
      }

      return Promise.all(promises);
   }

   public static getBimObjectsLinked(nodeId: string): Promise<Array<spinal.Model>> {
      return SpinalGraphService.getChildren(nodeId, [NETWORK_BIMOJECT_RELATION]);
   }

   public static getNetworkTreeBimObjects(contextId: string): Promise<Array<SpinalNode<any>>> {
      return SpinalGraphService.findNodes(contextId, [NETWORK_RELATION, NETWORK_BIMOJECT_RELATION], (node) => {
         return node.getType().get() === BIM_OBJECT_TYPE;
      })
   }

   public static getNetworkGroups(bimObjectId: string): Promise<Array<INodeInfoOBJ>> {
      let realNode = SpinalGraphService.getRealNode(bimObjectId);
      if (!realNode) return Promise.resolve([]);

      return realNode.getParents().then(parents => {
         parents = parents.filter(el => typeof el !== "undefined");
         let groups = parents.filter(el => {
            return el.getType().get() === NETWORK_TYPE;
         });

         return groups.map(el => el.info.get());
      })
   }

   public static getNetworkBimObjectParents(bimObjectId: string): Promise<Array<INodeInfoOBJ>> {
      let realNode = SpinalGraphService.getRealNode(bimObjectId);
      if (!realNode) return Promise.resolve([]);

      return realNode.getParents([NETWORK_BIMOJECT_RELATION, NETWORK_RELATION]).then(argParents => {

         let promises = argParents.map(async el => {
            if (el && el.getType().get() === BIM_OBJECT_TYPE) return el.info.get();

            let p = await this.getNetworkBimObjectParents(el ? el.info.id.get() : "");

            return p;

         });

         return Promise.all(promises).then(parents => {
            return Utilities._flatten(parents).filter(el => typeof el !== "undefined");
         })
      });

   }

}

export {
   NetworkTreeService
}