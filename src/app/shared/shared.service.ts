import { Inject, Injectable } from '@angular/core';
import Web3, { Web3BaseProvider } from 'web3';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  accounts!: string[];
  constructor(
    @Inject('Web3') private web3: Web3,
    @Inject('Window') private window: Window
  ) {}

  async connectWallet() {
    this.web3.givenProvider;
    if ('ethereum' in this.window) {
      const response = await (this.window.ethereum as Web3BaseProvider).request(
        {
          method: 'eth_requestAccounts',
        }
      );

      this.accounts = response as unknown as string[];

      console.log(this.accounts);
    } else {
      // tell user to install metamask
    }
  }
}
