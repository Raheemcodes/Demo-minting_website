import { Component } from '@angular/core';

@Component({
  selector: 'app-mint',
  templateUrl: './mint.component.html',
  styleUrls: ['./mint.component.scss'],
})
export class MintComponent {
  isLoading: boolean = false;
  error: boolean = false;
}
