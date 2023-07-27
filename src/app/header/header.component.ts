import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
  Renderer2,
} from '@angular/core';

import { delay } from 'rxjs';
import { SharedService } from '../shared/shared.service';
import { NavigationEnd, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';

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
    private router: Router,
    private renderer: Renderer2,
    @Inject('Window') private window: Window,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.router.events.pipe(delay(200)).subscribe((event) => {
      const path = ['/', '/marketplace', '/profile'];
      if (event instanceof NavigationEnd && path.includes(event.url)) {
        this.closeNav();
      }
    });
  }

  toggleNav() {
    const toggleBtn: HTMLElement = this.toggleBtn.nativeElement as HTMLElement;
    const nav: HTMLElement = this.nav.nativeElement as HTMLElement;

    if (!this.isOpen && !this.isAnimating) {
      this.isAnimating = true;
      nav.style.display = 'flex';
      this.document.body.classList.add('noscroll');

      setTimeout(() => {
        toggleBtn.classList.add('opened');
        nav.style.right = '0';
        this.isOpen = true;
        this.isAnimating = false;
      }, 300);
    } else {
      this.closeNav();
    }
  }

  closeNav() {
    if (!this.isAnimating) {
      this.isAnimating = true;

      const toggleBtn: HTMLElement = this.toggleBtn
        .nativeElement as HTMLElement;
      const nav: HTMLElement = this.nav.nativeElement as HTMLElement;

      if (this.document.body.classList.contains('noscroll'))
        this.document.body.classList.remove('noscroll');

      if (toggleBtn.classList.contains('opened'))
        toggleBtn.classList.remove('opened');

      nav.style.right = '-100vw';

      setTimeout(() => {
        nav.style.display = 'none';
        this.isOpen = false;
        this.isAnimating = false;
      }, 300);
    }
  }

  toggleDropdownPC(event: Event) {
    event.stopPropagation();
    const dropdown: HTMLElement = event.currentTarget as HTMLElement;
    const dropdownlist: HTMLElement = dropdown.querySelector(
      '.desktop-nav .dropdown-list'
    )!;

    if (dropdown.classList.contains('active')) {
      this.renderer.setStyle(dropdownlist, 'opacity', 0);

      setTimeout(() => {
        this.renderer.removeClass(dropdown, 'active');
      }, 300);
    } else {
      this.closeDropdownPc();
      this.renderer.addClass(dropdown, 'active');

      setTimeout(() => {
        this.renderer.setStyle(dropdownlist, 'opacity', 1);
      }, 300);
    }
  }

  closeDropdownPc() {
    this.document
      .querySelectorAll('.desktop-nav .nav-item.dropdown.active')
      .forEach((el) => {
        const dropdownlist: HTMLElement = el.querySelector('.dropdown-list')!;
        this.renderer.setStyle(dropdownlist, 'opacity', 0);

        setTimeout(() => {
          this.renderer.removeClass(el, 'active');
        }, 300);
      });
  }

  toggleDropdown(event: Event) {
    const dropdown: HTMLElement = event.currentTarget as HTMLElement;
    const height: number = dropdown.clientHeight;
    const list: HTMLElement = dropdown.querySelector(
      '.mobile-nav .dropdown-list'
    )!;

    if (dropdown.classList.contains('active')) {
      this.renderer.removeClass(dropdown, 'active');
      this.renderer.removeAttribute(dropdown, 'style');
    } else {
      this.renderer.addClass(dropdown, 'active');
      dropdown.style.height = `${height + list.clientHeight}px`;
    }
  }

  ngOnInit(): void {
    this.getAccount();

    this.window.addEventListener('resize', () => {
      if (this.isOpen && innerWidth >= 1280) this.toggleNav();
    });
    this.window.addEventListener('click', this.closeDropdownPc.bind(this));
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
    });
  }

  connect() {
    this.sharedService.connect();
  }
}
