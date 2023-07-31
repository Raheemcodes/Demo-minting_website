export interface ListCreated {
  seller: string;
  tokenId: bigint;
  price: bigint;
}

export interface ListRemoved {
  seller: string;
  tokenId: number;
}
