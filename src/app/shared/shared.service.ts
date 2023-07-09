import { Inject, Injectable } from '@angular/core';
import Web3 from 'web3';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  constructor(
    @Inject('Web3') private web3: Web3,
    @Inject('Window') private window: Window
  ) {}

  connectWallet() {
    if ('ethereum' in this.window) {
      console.log(this.web3);
    } else {
      // tell user to install metamask
    }
  }
}
