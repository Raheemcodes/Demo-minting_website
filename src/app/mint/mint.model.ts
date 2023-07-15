import { AzukiDemo } from './../../../../hardhat/typechain-types/contracts/AzukiDemo';

export interface NFT {
  name: string;
  image: string;
  attributes: { trait_type: string; value: string }[];
  navigation: {
    next: string | null;
    prev: string | null;
  };
  owner?: string;
}

export interface Mint {
  priceGWei: bigint;
  time: AzukiDemo.MintTimeStructOutput;
  total: bigint;
}

export interface Transfer {
  from: string;
  to: string;
  tokenId: bigint;
}
