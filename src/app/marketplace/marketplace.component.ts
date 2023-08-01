import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subscription, timer } from 'rxjs';
import Web3 from 'web3';
import { NFT } from '../mint/mint.model';
import { DataService } from '../shared/data.service';
import { SharedService } from '../shared/shared.service';
import NFTMarketPlaceAbi from '../mint/NFTMarketPlaceAbi';
import { environment } from 'src/environments/environment.development';
import { ListCreated, ListPurchased, ListRemoved } from '../shared/list.model';
import { ModalService } from '../modal/modal.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
})
export class MarketplaceComponent implements OnInit, OnDestroy {
  _isLoading: boolean = false;
  error: boolean = false;

  web3Provider = (<any>this.window).ethereum;
  marketplaceContract = new this.web3.eth.Contract(
    NFTMarketPlaceAbi,
    environment.marketplace
  );
  nfts!: NFT[];
  account!: string;
  subs: Subscription[] = [];

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
      if (this.subs[0]) this.subs[0].unsubscribe();

      this.subs[0] = timer(3000).subscribe(() => {
        this._isLoading = val;
      });
    }
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  ngOnInit(): void {
    this.fetchNFTs();
    this.getAccount();
    this.sub();
  }

  sub() {
    this.onListCreated();
    this.onListRemoved();
    this.onListPurchased();
  }

  genNumArr(num: number): number[] {
    return this.sharedService.generateNumArr(num);
  }

  toEther(num: number): number {
    return this.sharedService.toEther(num);
  }

  toWei(amount: number, unit: 'ether' | 'gwei' | 'szabo' | 'finney'): string {
    return this.web3.utils.toWei(amount, unit);
  }

  addNft(nft: NFT) {
    this.nfts.push(nft);
    this.nfts.sort((a, b) => a.price! - b.price!);
    this.cd.detectChanges();
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
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  onListCreated() {
    const sub = this.marketplaceContract.events.ListCreated({
      filter: { seller: this.account },
    });

    sub.on('data', (event) => {
      const { seller, tokenId, price }: ListCreated = event.returnValues as any;

      const lastNFT = this.nfts[this.nfts.length - 1];

      if (lastNFT.price! > Number(price)) {
        this.getNft(Number(tokenId), seller, Number(price));
      }
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

      this.nfts.forEach((nft, idx) => {
        const [name, id] = nft.name.split('#');

        if (+id == Number(tokenId)) this.nfts.splice(idx, 1);
        this.cd.detectChanges();
      });
    });

    sub.on('error', (err: any) => {
      this.sharedService.setErrorMsg(err);

      console.error(err);
    });
  }

  onListPurchased() {
    const sub = this.marketplaceContract.events.ListPurchased();

    sub.on('data', async (event) => {
      const { seller, tokenId, buyer }: ListPurchased =
        event.returnValues as any;

      this.nfts.forEach((nft, idx) => {
        const [name, id] = nft.name.split('#');

        if (+id === Number(tokenId)) this.nfts.splice(idx, 1);
        this.cd.detectChanges();
      });
    });

    sub.on('error', (err: any) => {
      console.error(err);
    });
  }

  async onbuy({ name, price }: NFT) {
    if (this.account) {
      try {
        const [title, tokenId] = name.split('#');

        this.marketplaceContract.setProvider(this.web3Provider);
        this.sub();
        this.marketplaceContract.handleRevert = true;

        await this.marketplaceContract.methods
          .buy(tokenId)
          .send({ from: this.account, value: `${price}` });
      } catch (err) {
        this.sharedService.setErrorMsg(err);
        console.error(err);
      }
    } else this.modalService.openModal$.next(true);
  }

  getNft(idx: number, owner: string, price: number) {
    this.error = false;
    this.cd.detectChanges();

    this.dataService.fetchNFT(idx, owner).subscribe({
      next: (nft) => {
        timer(3000).subscribe(() => {
          nft.price = price;
          this.addNft(nft);
        });
      },

      error: (err: HttpErrorResponse) => {
        this.error = true;
        this.cd.detectChanges();

        console.error(err);
      },
      complete: () => {
        console.log('fetch NFT successfully!');
      },
    });
  }

  fetchNFTs() {
    this.isLoading = true;
    this.error = false;

    this.dataService.fetchNFts(0, 20).subscribe({
      next: ({ nfts }) => {
        this.nfts = nfts;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = true;
        console.error(err);
      },
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => {
      if (sub) sub.unsubscribe();
    });
  }
}
