export interface IViewer {
  token: any;
  rawToken: string;
}

export interface Context {
  req: any;
  viewer: IViewer;
}
