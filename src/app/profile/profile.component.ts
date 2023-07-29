import { Component, Inject, OnInit } from '@angular/core';
import { timer } from 'rxjs';
import Web3 from 'web3';
import { NFT } from '../mint/mint.model';
import { ModalService } from '../modal/modal.service';
import { DataService } from '../shared/data.service';
import { SharedService } from '../shared/shared.service';
import AzukiDemoAbi from '../mint/AzukiDemoAbi';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  _isLoading: boolean = false;
  modalOpened: boolean = false;
  formOpened: boolean = false;
  error: boolean = false;
  openErrorMsg: boolean = false;

  account!: string;
  errorMsg!: string;
  tokenId!: number;
  nfts!: NFT[];

  web3Provider = (<any>this.window).ethereum;
  nftContract = new this.web3.eth.Contract(AzukiDemoAbi, environment.address);

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

  openModal() {
    this.modalOpened = true;
  }

  closeModal() {
    this.modalOpened = false;
  }

  openForm() {
    this.formOpened = true;
  }

  closeForm() {
    this.formOpened = false;
  }

  genNumArr(num: number): number[] {
    return this.sharedService.generateNumArr(num);
  }

  onclick() {
    this.sharedService.connect();
  }

  getAccount() {
    this.account = this.sharedService.account;

    if (!this.account) {
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

  onErrorClose() {
    this.openErrorMsg = false;
  }

  async onList(tokenName: string, owner: string) {
    try {
      const [name, tokenId] = tokenName.split('#');
      this.tokenId = +tokenId;

      const isApproved: boolean = await this.nftContract.methods
        .isApprovedForAll(owner, this.account)
        .call();

      if (!isApproved) {
        this.modalOpened = true;
        return;
      }

      this.formOpened = true;
    } catch (err) {
      console.error(err);
    }
  }

  async fetchNFT() {
    if (!this.account) return;
    this.isLoading = true;
    this.error = false;

    this.dataService.fetchYourNFTs(this.account).subscribe({
      next: ({ nfts }) => {
        this.nfts = nfts;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.error = true;
      },
      complete: () => {
        console.log('Profile: Tokens Fetch Success');
      },
    });
  }
}
