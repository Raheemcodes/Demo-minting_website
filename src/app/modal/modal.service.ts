import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  openModal$ = new Subject<true>();
  disableAutoClose$ = new Subject<true>();

  constructor() {}
}
