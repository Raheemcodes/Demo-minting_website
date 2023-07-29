import { Component, Inject, OnInit } from '@angular/core';
import { timer } from 'rxjs';
import Web3 from 'web3';
import { NFT } from '../mint/mint.model';
import { DataService } from '../shared/data.service';
import { SharedService } from '../shared/shared.service';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
})
export class MarketplaceComponent implements OnInit {
  _isLoading: boolean = false;
  error: boolean = false;

  web3Provider = (<any>this.window).ethereum;
  nfts!: NFT[];

  constructor(
    private dataService: DataService,
    private sharedService: SharedService,
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
    this.fetchNFTs();
  }

  genNumArr(num: number): number[] {
    return this.sharedService.generateNumArr(num);
  }

  fetchNFTs() {
    this.isLoading = true;
    this.error = false;

    this.dataService.fetchNFts(0, 2).subscribe({
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
}
