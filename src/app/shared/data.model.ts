import { NFT } from '../mint/mint.model';

export interface NFTResponse {
  msg: string;
  nfts: NFT[];
}
