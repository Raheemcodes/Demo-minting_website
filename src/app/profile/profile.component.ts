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
import { LogsSubscription } from 'web3-eth-contract';
import AzukiDemoAbi from '../mint/AzukiDemoAbi';
import NFTMarketPlaceAbi from '../mint/NFTMarketPlaceAbi';
import { NFT } from '../mint/mint.model';
import { ModalService } from '../modal/modal.service';
import { ListCreated } from '../shared/List.model';
import { DataService } from '../shared/data.service';
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

  onclick() {
    this.sharedService.connect();
  }

  onListCreated() {
    let sub!: LogsSubscription;
    if (sub) sub.unsubscribe();
    sub = this.marketplaceContract.events.ListCreated({
      filter: { nft: environment.address, seller: this.account },
    });

    sub.on('data', (event) => {
      const { tokenId, price }: ListCreated = event.returnValues as any;

      this.nfts.forEach((nft, index) => {
        const [name, nftId] = nft.name.split('#');
        if (tokenId === +nftId) {
          this.nfts[index].price = price;
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
    } else {
      this.modalService.openModal$.next(true);
    }
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
