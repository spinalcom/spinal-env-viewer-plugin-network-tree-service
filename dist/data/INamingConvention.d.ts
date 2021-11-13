export interface INamingConventionConfig {
    attributeName: string;
    useAttrValue: boolean;
    personalized?: {
        callback: Function;
    };
}
