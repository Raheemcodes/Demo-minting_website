import { Component, OnInit } from '@angular/core';
import { ModalService } from './modal/modal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  hasMetamaskWallet: boolean = 'ethereum' in window;
  openModal: boolean = true;

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    this.subOpenModal();
  }

  subOpenModal() {
    this.modalService.openModal$.subscribe(() => {
      this.openModal = true;
    });
  }

  onModalClose() {
    this.openModal = false;
  }
}
