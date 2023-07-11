import { Component, Inject, OnInit } from '@angular/core';
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
  isLoading: boolean = false;
  error: boolean = false;
  contract = new this.web3.eth.Contract(AzukiTransAbi, environment.address);
  account!: string;
  mint!: Mint;
  startTime!: string;
  publicsaleTime!: string;
  endTime!: string;

  constructor(
    private sharedService: SharedService,
    @Inject('Web3') private web3: Web3
  ) {}

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

  async getMintDetails() {
    this.mint = await this.contract.methods.mint().call();
  }
}
