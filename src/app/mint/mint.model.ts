import { AzukiTrans } from '../../../../hardhat/typechain-types/contracts/AzukiTrans';

export interface NFT {
  name: string;
  image: string;
  attributes: { trait_type: string; value: string }[];
  navigation: {
    next: string;
    prev: string;
  };
  owner?: string;
}

export interface Mint {
  priceGWei: bigint;
  time: AzukiTrans.MintTimeStructOutput;
  total: bigint;
}

export interface Transfer {
  from: string;
  to: string;
  tokenId: bigint;
}
