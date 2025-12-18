export interface Plugin {
    name: string,
    version: string,
    author: string,
    description: string,
    plane: React.FunctionComponent,
    setting: React.FunctionComponent,
    tab?: React.FunctionComponent,
}