import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  Renderer2,
  AfterViewInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { SharedService } from '../shared/shared.service';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('modal') modal!: ElementRef<HTMLElement>;
  sub: Subscription[] = [];
  @Output() onclose = new EventEmitter();

  constructor(
    private sharedService: SharedService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.closeModal();

    this.sharedService.account$.subscribe((account) => {
      if (account) this.close();
    });
  }

  ngAfterViewInit(): void {}

  onclick() {
    this.sharedService.connect();
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
      this.close();
    });
  }

  ngOnDestroy(): void {
    this.sub.forEach((sub) => {
      if (sub) sub.unsubscribe();
    });
  }
}
