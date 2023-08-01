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
  ChangeDetectorRef,
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
  isLoading: boolean = false;
  subs: Subscription[] = [];

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
    private cd: ChangeDetectorRef,
    @Inject('Window') private window: Window,
    @Inject('Web3') private web3: Web3
  ) {}

  ngOnInit(): void {
    this.getAccount();
  }

  getAccount() {
    this.account = this.sharedService.account;
    this.nftContract.setProvider(this.web3Provider);
  }

  async onclick() {
    try {
      this.isLoading = true;
      this.nftContract.handleRevert = true;
      this.cd.detectChanges();

      await this.nftContract.methods
        .setApprovalForAll(environment.marketplace, true)
        .send({ from: this.account });

      this.isApproved = true;
      this.isLoading = false;
      this.cd.detectChanges();
    } catch (err) {
      this.isLoading = false;
      this.cd.detectChanges();
      console.log(err);
    }
  }

  onclickBackdrop(event: Event) {
    const el = event.target as HTMLElement;

    if (el.classList.contains('backdrop')) this.close();
  }

  close() {
    if (this.subs[1]) this.subs[1].unsubscribe();

    this.renderer.addClass(this.modal.nativeElement, 'closed');
    this.renderer.addClass(this.backdrop.nativeElement, 'closed');

    this.subs[1] = timer(300).subscribe(() => this.onapproved.emit());
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => {
      if (sub) sub.unsubscribe();
    });
  }
}
