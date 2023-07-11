import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';

import Web3, { Web3BaseProvider } from 'web3';
import { SharedService } from '../shared/shared.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @ViewChild('nav') nav!: ElementRef<HTMLElement>;
  @ViewChild('toggleBtn') toggleBtn!: ElementRef<HTMLElement>;
  isOpen: boolean = false;
  isAnimating: boolean = false;
  account!: string;

  constructor(
    private sharedService: SharedService,
    private cd: ChangeDetectorRef,
    @Inject('Web3') private web3: Web3,
    @Inject('Window') private window: Window
  ) {}

  ngOnInit(): void {
    this.getAccount();
  }

  concatenateAccount(account: string): void {
    this.account = account?.slice(0, 6).padEnd(10, '.') + account?.slice(-4);
    this.cd.detectChanges();
  }

  getAccount() {
    this.sharedService.account$.subscribe({
      next: (account) => {
        this.concatenateAccount(account);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  async connect() {
    if ('ethereum' in this.window) {
      try {
        const response = await (
          this.window.ethereum as Web3BaseProvider
        ).request({
          method: 'eth_requestAccounts',
        });

        const accounts = response as unknown as string[];

        this.sharedService.account$.next(accounts[0]);

        (<Web3BaseProvider>this.window.ethereum).on(
          'accountsChanged',
          (newAccounts) => {
            this.sharedService.account$.next(newAccounts[0]);
            console.log('Updated Account:', newAccounts[0]);
          }
        );

        console.log('Account connected:', accounts[0]);
      } catch (err) {
        this.sharedService.account$.error(err);
      }
    } else {
      console.error('MetaMask or Trust Wallet not available.');
    }
  }
}
