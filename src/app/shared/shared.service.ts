import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, OnInit } from '@angular/core';
import { Observable, Subject, map } from 'rxjs';
import Web3, { Web3BaseProvider } from 'web3';
import { NFT } from '../mint/mint.model';

@Injectable({
  providedIn: 'root',
})
export class SharedService implements OnInit {
  account!: string;
  account$ = new Subject<string>();

  constructor(
    private http: HttpClient,
    @Inject('Web3') private web3: Web3,
    @Inject('Window') private window: Window
  ) {}

  ngOnInit(): void {}

  generateNumArr(num: number): number[] {
    const array: number[] = [];
    for (let i = 0; i < num; i++) array[i] = i + 1;
    return array;
  }

  async connect() {
    if ('ethereum' in this.window) {
      try {
        const response = await (
          this.window.ethereum as Web3BaseProvider
        ).request({
          method: 'eth_requestAccounts',
        });

        const accounts = response as unknown as string[];

        this.account$.next(accounts[0]);

        (<Web3BaseProvider>this.window.ethereum).on(
          'accountsChanged',
          (newAccounts) => {
            this.account$.next(newAccounts[0]);
            console.log('Updated Account:', newAccounts[0]);
          }
        );

        console.log('Account connected:', accounts[0]);
      } catch (err) {
        this.account$.error(err);
      }
    } else {
      console.error('MetaMask or Trust Wallet not available.');
    }
  }

  fetchNFT(idx: number): Observable<NFT> {
    return this.http
      .get<NFT>(
        `https://ipfs.io/ipfs/QmZcH4YvBVVRJtdn4RdbaqgspFU8gH6P9vomDpBVpAL3u4/${idx}`
      )
      .pipe(
        map((nft) => {
          return {
            ...nft,
            image: nft.image.replace('ipfs://', 'https://ipfs.io/ipfs/'),
          };
        })
      );
  }

  fetchAllNFT() {}
}
