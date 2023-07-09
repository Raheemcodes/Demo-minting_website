import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';

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

  constructor(
    private renderer: Renderer2,
    private sharedService: SharedService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {}

  connect() {
    this.sharedService.connectWallet();
  }
}
