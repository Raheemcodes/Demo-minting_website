import { Component, Inject, OnInit } from '@angular/core';
import { DataService } from '../shared/data.service';
import { SharedService } from '../shared/shared.service';
import { NFT } from '../mint/mint.model';
import { timer } from 'rxjs';
import Web3 from 'web3';
import { ModalService } from '../modal/modal.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  _isLoading: boolean = false;

  account!: string;
  web3Provider = (<any>this.window).ethereum;
  nfts!: NFT[];

  constructor(
    private dataService: DataService,
    private sharedService: SharedService,
    private modalService: ModalService,
    @Inject('Window') private window: Window,
    @Inject('Web3') private web3: Web3
  ) {}

  set isLoading(val: boolean) {
    if (val) this._isLoading = val;
    else {
      timer(3000).subscribe(() => {
        this._isLoading = val;
      });
    }
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  ngOnInit(): void {
    this.getAccount();
    this.fetchNFT();
  }

  genNumArr(num: number): number[] {
    return this.sharedService.generateNumArr(num);
  }

  getAccount() {
    this.account = this.sharedService.account;

    if (!this.account) {
      this.modalService.disableAutoClose$.next(true);
      this.modalService.openModal$.next(true);
    }

    this.sharedService.account$.subscribe({
      next: (account) => {
        if (!this.account) {
          // this.contract.setProvider(this.web3Provider);
          // this.onTransfer();
          this.account = account;
          this.fetchNFT();
        }

        this.account = account;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  async fetchNFT() {
    if (!this.account) return;
    this.isLoading = true;

    this.dataService.fetchYourNFTs(this.account).subscribe({
      next: ({ nfts }) => {
        this.nfts = nfts;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
      complete: () => {
        console.log('Profile: Tokens Fetch Success');
      },
    });
  }
}
