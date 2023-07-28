import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  Renderer2,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { SharedService } from '../shared/shared.service';
import { Subscription, timer } from 'rxjs';
import { ModalService } from './modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit, OnDestroy {
  @ViewChild('modal') modal!: ElementRef<HTMLElement>;
  sub: Subscription[] = [];
  isOpened: boolean = false;
  @Output() onclose = new EventEmitter();

  constructor(
    private sharedService: SharedService,
    private modalService: ModalService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.closeModal();
    this.subAutoClose();

    this.sharedService.account$.subscribe((account) => {
      if (account) this.close();
    });
  }

  onclick() {
    this.sharedService.connect();
  }

  subAutoClose() {
    this.modalService.disableAutoClose$.subscribe(() => {
      this.isOpened = true;
    });
  }

  close() {
    this.sub.forEach((sub) => {
      if (sub) sub.unsubscribe();
    });

    this.renderer.addClass(this.modal.nativeElement, 'closed');

    this.sub[0] = timer(500).subscribe(() => {
      this.onclose.emit();
    });
  }

  closeModal() {
    if (this.sub[1]) this.sub[1].unsubscribe();

    this.sub[1] = timer(5000).subscribe(() => {
      if (!this.isOpened) this.close();
    });
  }

  ngOnDestroy(): void {
    this.sub.forEach((sub) => {
      if (sub) sub.unsubscribe();
    });
  }
}
