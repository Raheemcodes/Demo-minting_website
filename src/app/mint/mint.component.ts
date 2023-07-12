import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription, interval, map, timer } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import Web3 from 'web3';
import { SharedService } from '../shared/shared.service';
import AzukiTransAbi from './AzukiTransAbi';
import { Mint, NFT, Transfer } from './mint.model';

@Component({
  selector: 'app-mint',
  templateUrl: './mint.component.html',
  styleUrls: ['./mint.component.scss'],
})
export class MintComponent implements OnInit {
  _isLoading: boolean = false;
  error: boolean = false;
  ctrlDown: boolean = false;
  isMint: boolean = false;
  contract = new this.web3.eth.Contract(AzukiTransAbi, environment.address);
  account!: string;
  mint!: Mint;
  startTime!: string;
  publicsaleTime!: string;
  endTime!: string;
  mintedSupply: number = 0;
  totalSupply: number = 0;
  sub: Subscription[] = [];
  nfts: NFT[] = [
    {
      name: 'Azuki#101',
      owner: '0x0fljflkf9400',
      image:
        'https://ipfs.io/ipfs/QmYDvPAXtiJg7s8JdRBSLWdgSphQdac8j1YuQNNxcGE1hg/101.png',
      attributes: [
        { trait_type: 'Hair', value: 'Blue' },
        { trait_type: 'Hair', value: 'Blue' },
        { trait_type: 'Hair', value: 'Blue' },
        { trait_type: 'Hair', value: 'Blue' },
        { trait_type: 'Hair', value: 'Blue' },
        { trait_type: 'Hair', value: 'Blue' },
      ],
      navigation: {
        next: '456',
        prev: '123',
      },
    },
  ];

  constructor(
    private sharedService: SharedService,
    private router: Router,
    private cd: ChangeDetectorRef,
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
    this.onTransfer();
  }

  trackBy(index: number, nft: NFT): number {
    return index;
  }

  generateNumArr(num: number): number[] {
    return this.sharedService.generateNumArr(num);
  }

  navigate(route: string) {
    const [name, id] = route.split('#');
    if (this.ctrlDown) window.open(location.href + '/' + route, '_blank');
    else this.router.navigate(['nft', id]);
  }

  getAccount() {
    this.sharedService.account$.subscribe({
      next: (account) => {
        this.account = account;

        if (this.isMint) this.safeMint();
      },
      error: (err) => {
        console.error(err);
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
    const mins = Math.floor(((Math.abs(duration) % oneDay) % oneHour) / oneMin);

    const remainingDays = !days ? '' : `${days} ${days > 1 ? 'days' : 'day'}`;
    const remainingHours = !hours
      ? ''
      : `${hours} ${hours > 1 ? 'hours' : 'hour'}`;
    const remainingMins = !mins ? '' : `${mins} ${mins > 1 ? 'mins' : 'min'}`;
    const remainingTime: string =
      Math.abs(duration) < oneMin
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
    let period: number = 60 * 1000 - new Date().getSeconds();

    interval(period).subscribe(() => {
      period = 60 * 1000;

      this.startTime = this.formatTime(this.mint.time.start);
      this.publicsaleTime = this.formatTime(this.mint.time.publicSale);
      this.endTime = this.formatTime(this.mint.time.end);
    });
  }

  loopSupply(mintedSupply: number, totalSupply: number) {
    this.sub[0] = this.loopTo(mintedSupply, 0).subscribe((val: number) => {
      this.mintedSupply = val;
    });

    this.sub[1] = this.loopTo(totalSupply, 1).subscribe((val: number) => {
      this.totalSupply = val;
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
    this.contract.events.Transfer().on('data', (event) => {
      const transfer: Transfer = event.returnValues as any;

      this.getNft(Number(transfer.tokenId), transfer.to);
    });
  }

  getNft(idx: number, owner: string) {
    this.sharedService.fetchNFT(idx).subscribe({
      next: (nft) => {
        this.addNft(nft);
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      },
      complete: () => {
        console.log('fetch NFT successfully!');
      },
    });
  }

  addNft(nft: NFT) {
    this.nfts.unshift(nft);
    this.mintedSupply++;
    this.cd.detectChanges();
  }

  async safeMint() {
    this.isMint = true;

    if (this.account) {
      try {
        this.contract.handleRevert = true;
        const txHash = await this.contract.methods.safeMint().send({
          from: this.account,
          value: `${Number(this.mint.priceGWei)}`,
        });

        console.log(txHash);

        this.isMint = false;
      } catch (err: any) {
        console.log(this.web3.utils.hexToAscii(err.data).trim());
      }
    } else {
      this.sharedService.connect();
    }
  }

  async getMintDetails() {
    try {
      this.isLoading = true;
      this.mint = await this.contract.methods.mint().call();
      const totalSupply = Number(
        await this.contract.methods.totalSupply().call()
      );
      const mintedSupply = Number(this.mint.total);

      this.loopSupply(mintedSupply, totalSupply);
      this.updateTime();
      this.isLoading = false;
    } catch (err) {
      console.error(err);
    }
  }
}
