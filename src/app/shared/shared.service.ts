import { Inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import Web3 from 'web3';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  account!: string;
  account$ = new Subject<string>();

  constructor(
    @Inject('Web3') private web3: Web3,
    @Inject('Window') private window: Window
  ) {}

  generateNumArr(num: number): number[] {
    const array: number[] = [];
    for (let i = 0; i < num; i++) array[i] = i + 1;
    return array;
  }
}
