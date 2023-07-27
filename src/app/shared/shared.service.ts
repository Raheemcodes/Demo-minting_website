import { Inject, Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import Web3, { Web3BaseProvider } from 'web3';
import { NFT } from '../mint/mint.model';
import { Router, UrlTree } from '@angular/router';
import { ModalService } from '../modal/modal.service';

@Injectable({
  providedIn: 'root',
})
export class SharedService implements OnInit {
  account!: string;
  account$ = new Subject<string>();
  nfts: NFT[] = [];
  nfts$ = new Subject<NFT[]>();
  noWallet$ = new Subject<string>();

  constructor(
    private router: Router,
    private modalService: ModalService,
    @Inject('Web3') private web3: Web3,
    @Inject('Window') private window: Window
  ) {}

  ngOnInit(): void {}

  canActivate(): true | UrlTree {
    if (!this.account) this.modalService.openModal$.next(true);
    return !!this.account || this.router.createUrlTree(['/']);
  }

  setAccount(account: string) {
    this.account = account;
    this.account$.next(account);
  }

  setNft(nft: NFT) {
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

  restructureNFTImage({ msg, nfts }: { msg: string; nfts: NFT[] }): {
    msg: string;
    nfts: NFT[];
  } {
    const mappedNFTs: NFT[] = nfts.map((nft) => {
      const restructuredNFT: NFT = {
        ...nft,
        image: nft.image.replace('ipfs://', 'https://ipfs.io/ipfs/'),
      };
      return restructuredNFT;
    });

    return { msg, nfts: mappedNFTs };
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
    ];

    msg =
      possibilities.find((val) => error.includes(val)) ||
      'An unknown error occured!';

    return msg;
  }
}
