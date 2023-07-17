import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  NgZone,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription, interval, map, timer } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import Web3 from 'web3';
import { SharedService } from '../shared/shared.service';
import AzukiDemoAbi from './AzukiDemoAbi';
import { Mint, NFT, Transfer } from './mint.model';

@Component({
  selector: 'app-mint',
  templateUrl: './mint.component.html',
  styleUrls: ['./mint.component.scss'],
})
export class MintComponent implements OnInit {
  _isLoading: boolean = false;
  error: boolean = false;
  openModal: boolean = true;
  openErrorMsg = false;

  errorMsg: string = '';
  web3Provider = (<any>this.window).ethereum;
  contract = new this.web3.eth.Contract(AzukiDemoAbi, environment.address);
  account!: string;
  mint!: Mint;
  startTime!: string;
  publicsaleTime!: string;
  endTime!: string;
  mintedSupply: number = 0;
  totalSupply: number = 0;
  sub: Subscription[] = [];
  nfts: NFT[] = [];
  screenWidth: number = this.window.innerWidth;
  DEFAULT_ADDRESS = '0x0000000000000000000000000000000000000000';

  constructor(
    private sharedService: SharedService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
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
    this.getMintDetails();
    this.getPastMint();
    this.subToNoWallet$();
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
    this.sharedService.account$.subscribe({
      next: (account) => {
        if (!this.account) {
          this.contract.setProvider(this.web3Provider);
          this.onTransfer();
        }
        this.account = account;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  subToNoWallet$() {
    this.sharedService.noWallet$.subscribe((msg) => {
      this.setErrorMsg(new Error(msg));
    });
  }

  onModalClose() {
    this.openModal = false;
  }

  setErrorMsg(err: any) {
    this.openErrorMsg = true;
    this.errorMsg = this.sharedService.handleError(err);
  }

  onErrorClose() {
    this.openErrorMsg = false;
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

    interval(60 * 1000).subscribe(() => {
      this.setTime();
    });
  }

  loopSupply(mintedSupply: number, totalSupply: number) {
    timer(3000).subscribe(() => {
      this.sub[0] = this.loopTo(mintedSupply, 0).subscribe((val: number) => {
        this.mintedSupply = val;
      });

      this.totalSupply = totalSupply;
    });
  }

  loopTo(to: number, idx: number): Observable<number> {
    let count: number = 0;

    return interval(1000 / to).pipe(
      map(() => {
        if (count == to) this.sub[idx].unsubscribe();
        count++;

        return count;
      })
    );
  }

  onTransfer() {
    const sub = this.contract.events.Transfer({
      filter: { from: this.DEFAULT_ADDRESS },
    });

    sub.on('data', (event) => {
      const transfer: Transfer = event.returnValues as any;

      this.mintedSupply++;
      this.getNft(Number(transfer.tokenId), transfer.to);
    });

    sub.on('error', (err: any) => {
      this.setErrorMsg(err);

      console.error(err);
    });
  }

  getNft(idx: number, owner: string) {
    this.error = false;

    this.sharedService.fetchNFT(idx, owner).subscribe({
      next: (nft) => {
        timer(3000).subscribe(() => {
          this.addNft(nft);
        });
      },
      error: (err: HttpErrorResponse) => {
        this.error = true;

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
        this.setErrorMsg(err);
      }
    } else {
      this.openModal = true;
    }
  }

  async getMintDetails() {
    try {
      this.isLoading = true;
      this.error = false;

      this.mint = await this.contract.methods.mint().call();

      this.mint.time = {
        ...this.mint.time,
        start: this.mint.time.start,
        publicSale: this.mint.time.publicSale,
        end: this.mint.time.end,
      };

      const totalSupply = Number(
        await this.contract.methods.totalSupply().call()
      );
      const mintedSupply = Number(this.mint.total);

      this.loopSupply(mintedSupply, totalSupply);
      this.updateTime();

      this.isLoading = false;
      this.error = false;
    } catch (err) {
      this.isLoading = false;
      this.error = true;
      this.setErrorMsg(err);

      console.error(err);
    }
  }

  async getPastMint() {
    try {
      const events = await this.contract.getPastEvents('Transfer', {
        filter: { from: this.DEFAULT_ADDRESS },
        fromBlock: 0,
        toBlock: 'latest',
      });

      events.forEach((event) => {
        const transfer: Transfer = (event as any).returnValues;

        this.getNft(Number(transfer.tokenId), transfer.to);
      });
    } catch (err) {
      console.error(err);
    }
  }
}
