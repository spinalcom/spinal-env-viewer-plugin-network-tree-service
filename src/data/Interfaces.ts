

export interface INodeInfoOBJ {
   name: string;
   id: string;
   type: string;
   [key: string]: any;
}

export interface IDataFormated {
   valids: Array<{
      automateItem: INodeInfoOBJ;
      profileItem: INodeInfoOBJ;
   }>;

   invalidAutomateItems: Array<INodeInfoOBJ>;
   invalidProfileItems: Array<INodeInfoOBJ>;
   automate: INodeInfoOBJ
}