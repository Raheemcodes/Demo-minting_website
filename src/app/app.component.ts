import { SharedService } from 'src/app/shared/shared.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ModalService } from './modal/modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  openModal: boolean = true;
  openErrorMsg = false;
  errorMsg!: string;

  subs: Subscription[] = [];

  constructor(
    private sharedService: SharedService,
    private modalService: ModalService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subOpenModal();
    this.subToNoWallet$();
    this.onErrorMsg();
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

  onErrorMsg() {
    this.sharedService.errorMsg$.subscribe((msg) => {
      this.openErrorMsg = true;
      this.errorMsg = msg;
    });
  }

  onErrorClose() {
    this.openErrorMsg = false;
  }

  subToNoWallet$() {
    if (this.subs[2]) this.subs[2].unsubscribe();
    this.subs[2] = this.sharedService.noWallet$.subscribe((msg) => {
      this.sharedService.setErrorMsg(new Error(msg));
    });
  }
}
