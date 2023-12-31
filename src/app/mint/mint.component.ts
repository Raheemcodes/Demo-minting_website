import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription, interval, map, timer } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import Web3, { Contract } from 'web3';
import { LogsSubscription } from 'web3-eth-contract/lib/commonjs/log_subscription';
import { ModalService } from '../modal/modal.service';
import { DataService } from '../shared/data.service';
import { SharedService } from '../shared/shared.service';
import NFTDemoAbi from './NFTDemoAbi';
import { Mint, NFT, Transfer } from './mint.model';

@Component({
  selector: 'app-mint',
  templateUrl: './mint.component.html',
  styleUrls: ['./mint.component.scss'],
})
export class MintComponent implements OnInit, OnDestroy {
  _isLoading: boolean = false;
  error: boolean = false;

  web3Provider = (<any>this.window).ethereum;
  contract!: Contract<typeof NFTDemoAbi>;
  account!: string;
  mint!: Mint;
  startTime!: string;
  publicsaleTime!: string;
  endTime!: string;
  mintedSupply: number = 0;
  totalSupply: number = 0;
  nfts: NFT[] = [];
  subs: Subscription[] = [];
  logsSub!: LogsSubscription;
  screenWidth: number = this.window.innerWidth;
  DEFAULT_ADDRESS = '0x0000000000000000000000000000000000000000';

  constructor(
    private sharedService: SharedService,
    private modalService: ModalService,
    private dataService: DataService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
    @Inject('Window') private window: Window,
    @Inject('Web3') private web3: Web3
  ) {}

  set isLoading(val: boolean) {
    if (val) this._isLoading = val;
    else {
      this.subs[0] = timer(3000).subscribe(() => {
        this._isLoading = val;
      });
    }
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  ngOnInit(): void {
    // this.onProviderChange();
    this.sub();
    this.getAccount();
    this.getMintDetails();
    this.getPastMint();
  }

  genNumArr(): number[] {
    let num: number;

    if (this.screenWidth >= 1536) num = 5;
    else if (this.screenWidth >= 1280) num = 4;
    else if (this.screenWidth >= 561) num = 3;
    else num = 2;

    return this.sharedService.generateNumArr(num);
  }

  navigate(route: string) {
    const [name, id] = route.split('#');

    this.zone.run(() => this.router.navigate(['nft', id]));
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

  getDate(time: BigInt): string {
    const date = new Date(Number(time) * 1000);
    return date.toDateString();
  }

  getLocaleTime(time: BigInt): string {
    const date = new Date(Number(time) * 1000);

    return date.toLocaleTimeString('uk', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatTime(time: bigint): string {
    const duration: number = Number(time) - Date.now() / 1000;
    const oneMin = 60;
    const oneHour = 60 * oneMin;
    const oneDay = 24 * oneHour;

    const days = Math.floor(Math.abs(duration) / oneDay);
    const hours = Math.floor((Math.abs(duration) % oneDay) / oneHour);
    const mins = Math[duration < 0 ? 'floor' : 'ceil'](
      ((Math.abs(duration) % oneDay) % oneHour) / oneMin
    );

    const remainingDays = !days ? '' : `${days} ${days > 1 ? 'days' : 'day'}`;
    const remainingHours = !hours
      ? ''
      : `${hours} ${hours > 1 ? 'hours' : 'hour'}`;
    const remainingMins = !mins ? '' : `${mins} ${mins > 1 ? 'mins' : 'min'}`;
    const remainingTime: string =
      duration < 0 && duration > -oneMin
        ? 'Now!!!'
        : `${
            duration > 0 ? 'In' : ''
          } ${remainingDays} ${remainingHours} ${remainingMins} ${
            duration < 0 ? 'ago' : ''
          }`;

    return remainingTime;
  }

  setTime() {
    this.startTime = this.formatTime(this.mint.time.start);
    this.publicsaleTime = this.formatTime(this.mint.time.publicSale);
    this.endTime = this.formatTime(this.mint.time.end);
  }

  updateTime() {
    this.setTime();
    if (this.subs[3]) this.subs[3].unsubscribe();

    this.subs[3] = interval(60 * 1000).subscribe(() => {
      this.setTime();
    });
  }

  loopSupply(mintedSupply: number, totalSupply: number) {
    if (this.subs[4]) this.subs[4].unsubscribe();

    this.subs[4] = timer(3000).subscribe(() => {
      if (this.subs[5]) this.subs[5].unsubscribe();

      this.subs[5] = this.loopTo(mintedSupply, 5).subscribe((val: number) => {
        this.mintedSupply = val;
      });

      this.totalSupply = totalSupply;
    });
  }

  loopTo(to: number, idx: number): Observable<number> {
    let count: number = 0;

    return interval(1000 / to).pipe(
      map(() => {
        if (count == to) this.subs[idx].unsubscribe();
        count++;

        return count;
      })
    );
  }

  sub() {
    if (this.logsSub) this.logsSub.removeAllListeners();

    this.contract = new this.web3.eth.Contract(NFTDemoAbi, environment.address);
    this.onTransfer();
  }

  onTransfer() {
    this.logsSub = this.contract.events.Transfer({
      filter: { from: this.DEFAULT_ADDRESS },
    });

    this.logsSub.on('data', (event) => {
      const { tokenId, to }: Transfer = event.returnValues as any;

      this.mintedSupply++;
      this.getNft(Number(tokenId), to);
    });

    this.logsSub.on('error', (err: any) => {
      this.sharedService.setErrorMsg(err);

      console.error(err);
    });
  }

  getNft(idx: number, owner: string) {
    this.error = false;
    this.cd.detectChanges();

    this.dataService.fetchNFT(idx, owner).subscribe({
      next: (nft) => {
        this.addNft(nft);
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

  addNft(nft: NFT) {
    this.nfts.unshift(nft);
    this.cd.detectChanges();
  }

  async safeMint() {
    this.error = false;
    this.cd.detectChanges();

    if (this.account) {
      try {
        this.contract.handleRevert = true;

        await this.contract.methods.safeMint().send({
          from: this.account,
          value: `${Number(this.mint.priceGWei)}`,
        });

        console.log('Minted Succesfully');
      } catch (err: any) {
        this.sharedService.setErrorMsg(err);
        console.error(err);
      }
    } else {
      this.modalService.openModal$.next(true);
    }
  }

  async getMintDetails() {
    try {
      this.isLoading = true;
      this.error = false;
      this.cd.detectChanges();

      this.mint = await this.contract.methods.getMint().call();

      this.mint.time = {
        ...this.mint.time,
        start: this.mint.time.start,
        publicSale: this.mint.time.publicSale,
        end: this.mint.time.end,
      };

      const totalSupply = Number(
        await this.contract.methods.getTotalSupply().call()
      );
      const mintedSupply = Number(this.mint.total);

      this.loopSupply(mintedSupply, totalSupply);
      this.updateTime();

      this.isLoading = false;
      this.error = false;
      this.cd.detectChanges();
    } catch (err) {
      this.isLoading = false;
      this.error = true;
      this.sharedService.setErrorMsg(err);
      this.cd.detectChanges();

      console.error(err);
    }
  }

  getPastMint() {
    this.dataService.fetchMintedNFts(0, 100).subscribe({
      next: ({ msg, nfts }) => {
        this.nfts = nfts;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.error = true;
        this.cd.detectChanges();

        this.sharedService.setErrorMsg(err, 'http');
        console.error(err);
      },
    });
  }

  ngOnDestroy(): void {
    this.logsSub.removeAllListeners();

    this.subs.forEach((sub) => {
      if (sub) sub.unsubscribe();
    });
  }
}
