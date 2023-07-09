export interface MetaInterface extends Card {
  keywords: string;
}

export interface Card {
  title: string;
  description: string;
  img: string;
  path: string;
}
