import { Component, Inject, OnInit } from '@angular/core';
import { interval, timer } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import Web3 from 'web3';
import { SharedService } from '../shared/shared.service';
import AzukiTransAbi from './AzukiTransAbi';
import { Mint } from './mint.model';

@Component({
  selector: 'app-mint',
  templateUrl: './mint.component.html',
  styleUrls: ['./mint.component.scss'],
})
export class MintComponent implements OnInit {
  _isLoading: boolean = false;
  error: boolean = false;
  contract = new this.web3.eth.Contract(AzukiTransAbi, environment.address);
  account!: string;
  mint!: Mint;
  startTime!: string;
  publicsaleTime!: string;
  endTime!: string;
  mintedSupply!: number;
  totalSupply!: number;

  constructor(
    private sharedService: SharedService,
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
  }

  getAccount() {
    this.sharedService.account$.subscribe({
      next: (account) => {
        this.account = account;
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
    const remainingTime: string = !duration
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

  async getMintDetails() {
    try {
      this.isLoading = true;
      this.mint = await this.contract.methods.mint().call();
      this.totalSupply = await this.contract.methods.totalSupply().call();
      this.mintedSupply = Number(this.mint.total);
      this.updateTime();
      this.isLoading = false;
    } catch (err) {
      console.error(err);
    }
  }
}
