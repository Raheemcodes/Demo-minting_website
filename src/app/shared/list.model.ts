export interface ListCreated {
  seller: string;
  tokenId: bigint;
  price: bigint;
}

export interface ListRemoved {
  seller: string;
  tokenId: number;
}

export interface ListPurchased {
  seller: string;
  buyer: string;
  tokenId: bigint;
  price: bigint;
}
