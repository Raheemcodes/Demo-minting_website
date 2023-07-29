import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ModalService } from './modal/modal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  hasMetamaskWallet: boolean = 'ethereum' in window;
  openModal: boolean = true;

  constructor(
    private modalService: ModalService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subOpenModal();
  }

  subOpenModal() {
    this.modalService.openModal$.subscribe(() => {
      this.openModal = true;
      this.cd.detectChanges();
    });
  }

  onModalClose() {
    this.openModal = false;
    this.cd.detectChanges();
  }
}
