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
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getAccount();
  }

  concatenateAccount(account: string): void {
    this.account = this.sharedService.concatenateAccount(account);
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

  connect() {
    this.sharedService.connect();
  }
}
