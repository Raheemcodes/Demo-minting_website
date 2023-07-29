import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  Output,
  EventEmitter,
  Renderer2,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { environment } from 'src/environments/environment.development';
import Web3 from 'web3';
import NFTMarketPlaceAbi from '../mint/NFTMarketPlaceAbi';
import AzukiDemoAbi from '../mint/AzukiDemoAbi';
import { SharedService } from '../shared/shared.service';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-approval-modal',
  templateUrl: './approval-modal.component.html',
  styleUrls: ['./approval-modal.component.scss'],
})
export class ApprovalModalComponent implements OnInit, OnDestroy {
  @ViewChild('modal') modal!: ElementRef<HTMLElement>;
  @ViewChild('backdrop') backdrop!: ElementRef<HTMLElement>;
  @Output() onapproved = new EventEmitter();
  isApproved: boolean = false;
  sub!: Subscription;

  web3Provider = (<any>this.window).ethereum;
  nftContract = new this.web3.eth.Contract(AzukiDemoAbi, environment.address);
  marketplaceContract = new this.web3.eth.Contract(
    NFTMarketPlaceAbi,
    environment.marketplace
  );

  account!: string;

  constructor(
    private sharedService: SharedService,
    private renderer: Renderer2,
    @Inject('Window') private window: Window,
    @Inject('Web3') private web3: Web3
  ) {}

  ngOnInit(): void {
    this.getAccount();
  }

  getAccount() {
    this.account = this.sharedService.account;
  }

  async onclick() {
    try {
      const tx = await this.nftContract.methods
        .setApprovalForAll(environment.marketplace, true)
        .send({ from: this.account });
    } catch (err) {
      console.log(err);
    }
  }

  onclickBackdrop(event: Event) {
    const el = event.target as HTMLElement;

    if (el.classList.contains('backdrop')) this.close();
  }

  close() {
    if (this.sub) this.sub.unsubscribe();

    this.renderer.addClass(this.modal.nativeElement, 'closed');
    this.renderer.addClass(this.backdrop.nativeElement, 'closed');

    this.sub = timer(300).subscribe(() => {
      this.onapproved.emit();
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }
}
