import { Inject, Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Subject } from 'rxjs';
import Web3, { Web3BaseProvider } from 'web3';
import { NFT } from '../mint/mint.model';
import { ModalService } from '../modal/modal.service';
import { NFTResponse } from './data.model';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  account!: string;
  account$ = new Subject<string>();
  nfts: NFT[] = [];
  nfts$ = new Subject<NFT[]>();
  noWallet$ = new Subject<string>();
  errorMsg$ = new Subject<string>();

  constructor(
    private router: Router,
    private modalService: ModalService,
    @Inject('Window') private window: Window,
    @Inject('Web3') private web3: Web3
  ) {}

  canActivate(): true | UrlTree {
    if (!this.account) this.modalService.openModal$.next(true);
    return !!this.account || this.router.createUrlTree(['/']);
  }

  setAccount(account: string) {
    this.account = account;
    this.account$.next(account);
  }

  setNFTs(nft: NFT[]) {
    this.nfts = nft;
    this.nfts$.next(this.nfts);
  }

  unshiftNFT(nft: NFT) {
    this.nfts.unshift(nft);
    this.nfts$.next(this.nfts);
  }

  concatenateAccount(account: string): string {
    return account?.slice(0, 6).padEnd(10, '.') + account?.slice(-4);
  }

  generateNumArr(num: number): number[] {
    const array: number[] = [];
    for (let i = 0; i < num; i++) array[i] = i + 1;
    return array;
  }

  async connect() {
    if ('ethereum' in this.window) {
      try {
        const web3Provider = <Web3BaseProvider>this.window.ethereum;
        this.web3.setProvider(web3Provider);

        const response = await web3Provider.request({
          method: 'eth_requestAccounts',
        });

        const accounts = response as unknown as string[];

        this.setAccount(accounts[0]);

        web3Provider.on('accountsChanged', (newAccounts) => {
          this.setAccount(newAccounts[0]);
          console.log('Updated Account:', newAccounts[0]);
        });

        console.log('Account connected:', accounts[0]);
      } catch (err) {
        this.account$.error(err);
      }
    } else {
      this.noWallet$.next('You do not have metamask wallet');
    }
  }

  getIdx(name: string): string {
    return name.split('#')[1];
  }

  toEther(num: number): number {
    return +this.web3.utils.fromWei(num, 'ether');
  }

  restructureNFTImage({ msg, nfts }: NFTResponse): NFTResponse {
    const mappedNFTs: NFT[] = nfts.map((nft) => {
      const restructuredNFT: NFT = {
        ...nft,
        image: nft.image.replace('ipfs://', 'https://ipfs.io/ipfs/'),
      };
      return restructuredNFT;
    });

    return { msg, nfts: mappedNFTs };
  }

  setErrorMsg(err: any, opt?: 'http') {
    if (opt == 'http') this.errorMsg$.next(this.handleHttpError(err));
    else this.errorMsg$.next(this.handleError(err));
  }

  handleHttpError(error: HttpErrorResponse) {
    let errorMsg: string = 'An unknown error!';

    switch (error.message) {
      case 'INVALID_SKIP':
        errorMsg = "Invalid 'skip' query params";
        break;

      case 'EXCEED_COUNT':
        errorMsg = "'skip' has exceeded toal tokend";
        break;

      case 'INVALID_LIMIT':
        errorMsg = "Invalid 'limit' query params";
        break;

      case 'INVALID_ADDRESS':
        errorMsg = 'Invalid account address';
        break;
    }

    return errorMsg;
  }

  handleError({
    message,
    reason,
    data,
  }: {
    message: string;
    reason: string;
    data: { message: string };
  }): string {
    let msg: string = 'An error occured!';
    let error: string = '';

    if (data) error = data.message;
    else if (message) error = message;
    else if (reason) error = reason;

    const possibilities = [
      'Mint has either ended or not started',
      "You've minted!",
      'All token have been minted',
      'Invalid amount',
      'missing role',
      'Failed to fetch',
      'User denied transaction signature',
      'You do not have metamask wallet',
      'Token is not listed',
      'List price must be > 0',
      'Token has already been listed',
      'This contract is not approved to transfer this token',
      "You're not the owner of this token",
      "You can't buy your own nft rather unlist it",
    ];

    msg =
      possibilities.find((val) => error.includes(val)) ||
      'An unknown error occured!';

    return msg;
  }
}
