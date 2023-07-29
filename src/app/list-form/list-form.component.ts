import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Input,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { NgForm } from '@angular/forms';
import AzukiDemoAbi from '../mint/AzukiDemoAbi';
import { environment } from 'src/environments/environment.development';
import NFTMarketPlaceAbi from '../mint/NFTMarketPlaceAbi';
import { SharedService } from '../shared/shared.service';
import Web3 from 'web3';

@Component({
  selector: 'app-list-form',
  templateUrl: './list-form.component.html',
  styleUrls: ['./list-form.component.scss'],
})
export class ListFormComponent implements OnInit, OnDestroy {
  @ViewChild('modal') modal!: ElementRef<HTMLElement>;
  @ViewChild('backdrop') backdrop!: ElementRef<HTMLElement>;
  @Output() onclose = new EventEmitter();
  @Input() tokenId!: number;
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
    console.log(this.tokenId);
    this.getAccount();
  }

  getAccount() {
    this.account = this.sharedService.account;
  }

  onsubmit(form: NgForm) {
    // try {
    console.log(form.value);
    this.close();
    // } catch (err) {
    //   console.log(err);
    // }
  }

  onclickBackdrop(event: Event) {
    const el = event.target as HTMLElement;

    if (el.classList.contains('backdrop')) this.close();
  }

  close() {
    if (this.sub) this.sub.unsubscribe();

    this.renderer.addClass(this.modal.nativeElement, 'closed');
    this.renderer.addClass(this.backdrop.nativeElement, 'closed');

    this.sub = timer(500).subscribe(() => {
      this.onclose.emit();
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }
}
