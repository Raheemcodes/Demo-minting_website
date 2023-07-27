export interface NFT {
  name: string;
  image: string;
  attributes: { trait_type: string; value: string }[];
  navigation: {
    next: string | null;
    prev: string | null;
  };
  price?: number;
  owner?: string;
}

export type MintTimeStructOutput = [
  start: bigint,
  publicSale: bigint,
  end: bigint
] & { start: bigint; publicSale: bigint; end: bigint };

export interface Mint {
  priceGWei: bigint;
  time: MintTimeStructOutput;
  total: bigint;
}

export interface Transfer {
  from: string;
  to: string;
  tokenId: bigint;
}
