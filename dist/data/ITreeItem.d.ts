export interface ITreeItem {
    id: string | number;
    parentId: string | number;
    children?: Array<ITreeItem>;
}
