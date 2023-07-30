import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription, timer } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import Web3 from 'web3';
import AzukiDemoAbi from '../mint/AzukiDemoAbi';
import NFTMarketPlaceAbi from '../mint/NFTMarketPlaceAbi';
import { ModalService } from '../modal/modal.service';
import { SharedService } from '../shared/shared.service';

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

  isListed: boolean = false;
  error: boolean = false;
  isLoading: boolean = false;
  subs: Subscription[] = [];

  web3Provider = (<any>this.window).ethereum;
  // nftContract = new this.web3.eth.Contract(AzukiDemoAbi, environment.address);
  marketplaceContract = new this.web3.eth.Contract(
    NFTMarketPlaceAbi,
    environment.marketplace
  );

  account!: string;

  constructor(
    private sharedService: SharedService,
    private modalService: ModalService,
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
    this.marketplaceContract.setProvider(this.web3Provider);

    this.sharedService.account$.subscribe(() => this.close());
  }

  async onsubmit(form: NgForm) {
    if (this.account) {
      try {
        this.isLoading = true;
        this.error = false;
        this.marketplaceContract.handleRevert = true;
        this.cd.detectChanges();

        const { price }: { price: number } = form.value;
        await this.marketplaceContract.methods
          .list(this.tokenId, this.web3.utils.toWei(price, 'ether'))
          .send({ from: this.account });

        form.reset();
        this.isLoading = false;
        this.isListed = true;
        this.close();
        this.cd.detectChanges();
      } catch (err) {
        this.isLoading = false;
        this.error = true;

        this.sharedService.setErrorMsg(err);
        this.cd.detectChanges();
        console.error(err);
      }
    } else {
      this.modalService.openModal$.next(true);
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

    this.subs[1] = timer(500).subscribe(() => {
      this.onclose.emit();
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => {
      if (sub) sub.unsubscribe();
    });
  }
}
