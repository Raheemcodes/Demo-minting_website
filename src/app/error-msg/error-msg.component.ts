import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { SharedService } from '../shared/shared.service';

@Component({
  selector: 'app-error-msg',
  templateUrl: './error-msg.component.html',
  styleUrls: ['./error-msg.component.scss'],
})
export class ErrorMsgComponent implements OnInit, OnDestroy {
  sub: Subscription[] = [];
  @Output() onclose = new EventEmitter();

  constructor(
    private sharedService: SharedService,
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.closeModal();
  }

  onclick() {
    this.sharedService.connect();
  }

  close() {
    this.sub.forEach((sub) => {
      if (sub) sub.unsubscribe();
    });

    this.renderer.addClass(this.el.nativeElement, 'closed');

    this.sub[0] = timer(500).subscribe(() => {
      this.onclose.emit();
    });
  }

  closeModal() {
    if (this.sub[1]) this.sub[1].unsubscribe();

    this.sub[1] = timer(8000).subscribe(() => {
      this.close();
    });
  }

  ngOnDestroy(): void {
    this.sub.forEach((sub) => {
      if (sub) sub.unsubscribe();
    });
  }
}
