export interface IViewer {
  token: any;
  rawToken: string;
}

export interface GraphQLContext {
  req: any;
  viewer: IViewer;
}
