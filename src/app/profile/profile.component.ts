import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import Web3 from 'web3';
import AzukiDemoAbi from '../mint/AzukiDemoAbi';
import NFTMarketPlaceAbi from '../mint/NFTMarketPlaceAbi';
import { NFT } from '../mint/mint.model';
import { ModalService } from '../modal/modal.service';
import { DataService } from '../shared/data.service';
import { ListCreated, ListRemoved } from '../shared/list.model';
import { SharedService } from '../shared/shared.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  _isLoading: boolean = false;
  modalOpened: boolean = false;
  formOpened: boolean = false;
  error: boolean = false;
  openErrorMsg: boolean = false;

  account!: string;
  errorMsg!: string;
  tokenId!: number;
  nfts!: NFT[];
  subs: Subscription[] = [];

  web3Provider = (<any>this.window).ethereum;
  nftContract = new this.web3.eth.Contract(AzukiDemoAbi, environment.address);
  marketplaceContract = new this.web3.eth.Contract(
    NFTMarketPlaceAbi,
    environment.marketplace
  );

  constructor(
    private dataService: DataService,
    private sharedService: SharedService,
    private modalService: ModalService,
    private cd: ChangeDetectorRef,
    @Inject('Window') private window: Window,
    @Inject('Web3') private web3: Web3
  ) {}

  set isLoading(val: boolean) {
    if (val) this._isLoading = val;
    else {
      this.subs[0] = timer(3000).subscribe(() => {
        this._isLoading = val;
        this.cd.detectChanges();
      });
    }
    this.cd.detectChanges();
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

  toCheckSumAddress(address: string): string {
    return this.web3.utils.toChecksumAddress(address);
  }

  onclick() {
    this.sharedService.connect();
  }

  onListCreated() {
    const sub = this.marketplaceContract.events.ListCreated({
      filter: { seller: this.account },
    });

    sub.on('data', (event) => {
      const { tokenId, price }: ListCreated = event.returnValues as any;

      this.nfts.forEach((nft, index) => {
        const [name, nftId] = nft.name.split('#');

        if (Number(tokenId) === +nftId) {
          this.nfts[index].price = +this.web3.utils.fromWei(price, 'ether');
          this.cd.detectChanges();
        }
      });
    });

    sub.on('error', (err: any) => {
      this.sharedService.setErrorMsg(err);

      console.error(err);
    });
  }

  onListRemoved() {
    const sub = this.marketplaceContract.events.ListRemoved({
      filter: { seller: this.account },
    });

    sub.on('data', (event) => {
      const { tokenId }: ListRemoved = event.returnValues as any;

      this.nfts.forEach((nft, index) => {
        const [name, nftId] = nft.name.split('#');

        if (Number(tokenId) === +nftId) {
          this.nfts[index].price = undefined;
          this.cd.detectChanges();
        }
      });
    });

    sub.on('error', (err: any) => {
      this.sharedService.setErrorMsg(err);

      console.error(err);
    });
  }

  getAccount() {
    this.account = this.sharedService.account;
    if (this.subs[1]) this.subs[1].unsubscribe();

    if (!this.account) {
      this.modalService.openModal$.next(true);
    }

    this.subs[1] = this.sharedService.account$.subscribe({
      next: (account) => {
        this.account = account;
        this.fetchNFT();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  onErrorClose() {
    this.openErrorMsg = false;
  }

  async onList(tokenName: string) {
    if (this.account) {
      try {
        const [name, tokenId] = tokenName.split('#');
        this.tokenId = +tokenId;

        this.nftContract.setProvider(this.web3Provider);
        this.onListCreated();
        this.nftContract.handleRevert = true;

        const isApproved: boolean = await this.nftContract.methods
          .isApprovedForAll(this.account, environment.marketplace)
          .call();

        if (!isApproved) {
          this.modalOpened = true;
          this.cd.detectChanges();
          return;
        }

        this.formOpened = true;
        this.cd.detectChanges();
      } catch (err) {
        this.sharedService.setErrorMsg(err);
        console.error(err);
      }
    } else this.modalService.openModal$.next(true);
  }

  async onunlist(tokenName: string) {
    if (this.account) {
      try {
        const [name, tokenId] = tokenName.split('#');
        this.tokenId = +tokenId;

        this.marketplaceContract.setProvider(this.web3Provider);
        this.onListRemoved();
        this.marketplaceContract.handleRevert = true;

        const isApproved: boolean = await this.nftContract.methods
          .isApprovedForAll(this.account, environment.marketplace)
          .call();

        if (!isApproved) {
          this.modalOpened = true;
          this.cd.detectChanges();
          return;
        }

        await this.marketplaceContract.methods
          .unlist(tokenId)
          .send({ from: this.account });
      } catch (err) {
        this.sharedService.setErrorMsg(err);
        console.error(err);
      }
    } else this.modalService.openModal$.next(true);
  }

  async fetchNFT() {
    if (!this.account) return;
    if (this.subs[2]) this.subs[2].unsubscribe();

    this.isLoading = true;
    this.error = false;
    this.cd.detectChanges();

    this.subs[2] = this.dataService.fetchYourNFTs(this.account).subscribe({
      next: ({ nfts }) => {
        this.nfts = nfts;
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.error = true;
        this.cd.detectChanges();
      },
      complete: () => {
        console.log('Profile: Tokens Fetch Success');
      },
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => {
      if (sub) sub.unsubscribe();
    });
  }
}
