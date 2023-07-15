import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
  NgZone,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { timer } from 'rxjs';
import { SharedService } from 'src/app/shared/shared.service';
import { NFT } from '../mint.model';

@Component({
  selector: 'app-nft',
  templateUrl: './nft.component.html',
  styleUrls: ['./nft.component.scss'],
})
export class NftComponent implements OnInit, OnDestroy {
  @ViewChild('backdrop') backdrop!: ElementRef<HTMLElement>;
  @ViewChild('main') main!: ElementRef<HTMLElement>;

  pageSwitched: boolean = true;
  _isLoading: boolean = false;
  error: boolean = false;

  screenWidth!: number;
  name!: string;
  nft!: NFT;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private zone: NgZone,
    @Inject(DOCUMENT) private document: Document
  ) {}

  set isLoading(val: boolean) {
    if (val) this._isLoading = val;
    else {
      timer(2000).subscribe(() => {
        this._isLoading = val;
      });
    }
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  ngOnInit(): void {
    this.document.body.classList.add('noscroll');
    this.screenWidth = innerWidth;

    this.route.params.subscribe((params) => {
      this.name = params['id'];
      this.fetchNft();
    });

    window.onresize = () => (this.screenWidth = innerWidth);
  }

  navigate(route: string) {
    if (!this.isLoading) {
      this.zone.run(() => this.router.navigate(['nft', route]));
    }
  }

  close() {
    this.backdrop.nativeElement.style.transition = 'opacity 0.3s ease-out';
    this.main.nativeElement.style.transition = 'transform 0.3s ease-out';
    this.backdrop.nativeElement.style.opacity = '0';
    this.main.nativeElement.style.transform = 'translateY(2rem)';
    timer(300).subscribe(() => {
      this.zone.run(() =>
        this.router.navigate(['..'], { relativeTo: this.route })
      );
    });
  }

  backdropClose(event: Event) {
    const el = event.target as HTMLElement;

    if (el.classList.contains('backdrop')) this.close();
  }

  onSwitchPage(page: 'desc' | 'trait') {
    if (page == 'desc') this.pageSwitched = false;
    if (page == 'trait') this.pageSwitched = true;
  }

  concatenateAccount(account: string): string {
    return account == 'you'
      ? account
      : this.sharedService.concatenateAccount(account);
  }

  fetchNft() {
    this.isLoading = true;

    let index: number;
    const length: number = this.sharedService.nfts.length;

    if (!length) {
      this.zone.run(() => this.router.navigate(['/']));
      return;
    }

    const nft = this.sharedService.nfts.find((nft, idx) => {
      if (this.sharedService.getIdx(nft.name) === this.name) {
        index = idx;

        return true;
      } else return false;
    })!;

    const prevIdx: number | null = index! > 0 ? index! - 1 : null;
    const nextIdx: number | null = index! < length - 1 ? index! + 1 : null;

    let prev: string | null = null;
    let next: string | null = null;

    if (prevIdx! === 0 || prevIdx! > 0) {
      prev = this.sharedService.getIdx(this.sharedService.nfts[prevIdx!].name);
    }

    if (nextIdx) {
      next = this.sharedService.getIdx(this.sharedService.nfts[nextIdx!].name);
    }

    const modifiedNft: NFT = {
      ...nft,
      owner:
        nft.owner?.toLowerCase() == this.sharedService.account?.toLowerCase()
          ? 'you'
          : nft.owner!,
      navigation: { prev, next },
    };

    this.nft = modifiedNft;
    this.isLoading = false;
  }

  ngOnDestroy(): void {
    if (this.document.body.classList.contains('noscroll')) {
      this.document.body.classList.remove('noscroll');
    }
  }
}
