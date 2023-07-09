import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { NFT } from '../mint.model';
// import { GalleryService } from './../gallery.service';

@Component({
  selector: 'app-nft',
  templateUrl: './nft.component.html',
  styleUrls: ['./nft.component.scss'],
})
export class NftComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('backdrop') backdrop!: ElementRef<HTMLElement>;
  @ViewChild('main') main!: ElementRef<HTMLElement>;
  screenWidth!: number;
  pageSwitched: boolean = true;
  name!: string;
  nft: NFT = {
    name: 'Azuki',
    image: '../../../assets/team/Age.jpg',
    attributes: [
      { trait_type: 'Hair', value: 'Blue' },
      { trait_type: 'Hair', value: 'Blue' },
      { trait_type: 'Hair', value: 'Blue' },
      { trait_type: 'Hair', value: 'Blue' },
      { trait_type: 'Hair', value: 'Blue' },
      { trait_type: 'Hair', value: 'Blue' },
    ],
    navigation: {
      next: '#456',
      prev: '#123',
    },
  };
  $nft = new BehaviorSubject<NFT | null>(null);
  isLoading: boolean = false;
  error: boolean = false;
  desc!: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    // private gallerySv: GalleryService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.document.body.classList.add('noscroll');
    this.screenWidth = innerWidth;

    this.route.params.subscribe((params) => {
      this.name = params['id'];
      // this.fetchNft();
    });

    window.onresize = () => (this.screenWidth = innerWidth);
  }

  ngAfterViewInit(): void {}

  navigate(route: string) {
    if (!this.isLoading) {
      this.router.navigate(['gallery', route]);
    }
  }

  close() {
    this.backdrop.nativeElement.style.transition = 'opacity 0.3s ease-out';
    this.main.nativeElement.style.transition = 'transform 0.3s ease-out';
    this.backdrop.nativeElement.style.opacity = '0';
    this.main.nativeElement.style.transform = 'translateY(2rem)';
    setTimeout(() => {
      this.router.navigate(['..'], { relativeTo: this.route });
    }, 300);
  }

  backdropClose(event: Event) {
    const el = event.target as HTMLElement;

    if (el.classList.contains('backdrop')) this.close();
  }

  onSwitchPage(page: 'desc' | 'trait') {
    if (page == 'desc') this.pageSwitched = false;
    if (page == 'trait') this.pageSwitched = true;
  }

  fetchNft() {
    this.isLoading = true;

    // this.gallerySv.fetchNft(this.name).subscribe({
    //   next: (res) => {
    //     this.nft = res;
    //     this.$nft.next(res);
    //     this.shorten();
    //     this.isLoading = false;
    //   },
    //   error: (err) => {
    //     console.error(err);
    //     this.error = true;
    //     this.isLoading = false;
    //   },
    // });
  }

  ngOnDestroy(): void {
    if (this.document.body.classList.contains('noscroll')) {
      this.document.body.classList.remove('noscroll');
    }
  }
}
