import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import Web3, { Contract } from 'web3';
import { LogsSubscription } from 'web3-eth-contract/lib/commonjs/log_subscription';
import NFTMarketPlaceAbi from '../mint/NFTMarketPlaceAbi';
import { NFT } from '../mint/mint.model';
import { ModalService } from '../modal/modal.service';
import { DataService } from '../shared/data.service';
import { ListCreated, ListPurchased, ListRemoved } from '../shared/list.model';
import { SharedService } from '../shared/shared.service';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
})
export class MarketplaceComponent implements OnInit, OnDestroy {
  _isLoading: boolean = false;
  error: boolean = false;

  contract!: Contract<typeof NFTMarketPlaceAbi>;
  nfts: NFT[] = [];
  account!: string;
  subs: Subscription[] = [];
  logsSub: LogsSubscription[] = [];

  constructor(
    private dataService: DataService,
    private sharedService: SharedService,
    private modalService: ModalService,
    private cd: ChangeDetectorRef,
    @Inject('Web3') private web3: Web3
  ) {}

  set isLoading(val: boolean) {
    if (val) this._isLoading = val;
    else {
      if (this.subs[0]) this.subs[0].unsubscribe();

      this.subs[0] = timer(3000).subscribe(() => {
        this._isLoading = val;
        this.cd.detectChanges();
      });
      this.cd.detectChanges();
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

  unsub() {
    this.logsSub.forEach((sub) => {
      if (sub) sub.removeAllListeners();
    });
  }

  sub() {
    this.unsub();

    this.contract = new this.web3.eth.Contract(
      NFTMarketPlaceAbi,
      environment.marketplace
    );

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
    const lastNFT = this.nfts[this.nfts.length - 1];

    if (lastNFT?.price! > nft.price!) {
      this.nfts.unshift(nft);
    } else {
      this.nfts.push(nft);
    }
    // this.nfts.sort((a, b) => a.price! - b.price!);
    this.cd.detectChanges();
  }

  getAccount() {
    this.account = this.sharedService.account;

    if (this.subs[1]) this.subs[1].unsubscribe();

    this.subs[1] = this.sharedService.account$.subscribe({
      next: (account) => {
        if (!this.account) this.sub();

        this.account = account;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  onListCreated() {
    this.logsSub[0] = this.contract.events.ListCreated({
      filter: { seller: this.account },
    });

    this.logsSub[0].on('data', (event) => {
      const { seller, tokenId, price }: ListCreated = event.returnValues as any;

      this.getNft(Number(tokenId), seller, Number(price));
    });

    this.logsSub[0].on('error', (err: any) => {
      this.sharedService.setErrorMsg(err);

      console.error(err);
    });
  }

  onListRemoved() {
    this.logsSub[1] = this.contract.events.ListRemoved({
      filter: { seller: this.account },
    });

    this.logsSub[1].on('data', (event) => {
      const { tokenId }: ListRemoved = event.returnValues as any;

      this.nfts.forEach((nft, idx) => {
        const [name, id] = nft.name.split('#');

        if (+id == Number(tokenId)) this.nfts.splice(idx, 1);
        this.cd.detectChanges();
      });
    });

    this.logsSub[1].on('error', (err: any) => {
      this.sharedService.setErrorMsg(err);

      console.error(err);
    });
  }

  onListPurchased() {
    this.logsSub[2] = this.contract.events.ListPurchased();

    this.logsSub[2].on('data', async (event) => {
      const { tokenId }: ListPurchased = event.returnValues as any;

      this.nfts.forEach((nft, idx) => {
        const [name, id] = nft.name.split('#');

        if (+id === Number(tokenId)) this.nfts.splice(idx, 1);
        this.cd.detectChanges();
      });
    });

    this.logsSub[2].on('error', (err: any) => {
      console.error(err);
    });
  }

  async onbuy({ name, price }: NFT) {
    if (this.account) {
      try {
        const [title, tokenId] = name.split('#');

        this.contract.handleRevert = true;

        await this.contract.methods
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

    this.dataService.fetchListedNFts(0, 20).subscribe({
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
    this.unsub();

    this.subs.forEach((sub) => {
      if (sub) sub.unsubscribe();
    });
  }
}
