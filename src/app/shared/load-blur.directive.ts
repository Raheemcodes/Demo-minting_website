import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
} from '@angular/core';
import { decodeBlurHash, getBlurHashAverageColor } from 'fast-blurhash';

@Directive({
  selector: '[appLoadBlur]',
  standalone: true,
})
export class LoadBlurDirective implements OnInit, AfterViewInit {
  @Input() appLoadBlur!: string;
  @Input('blurhash-type') type: 'blur' | '' = '';

  constructor(
    private elRef: ElementRef<HTMLCanvasElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    if (this.type == 'blur') {
      const pixels = decodeBlurHash(this.appLoadBlur, 300, 300);
      const ctx = this.elRef.nativeElement.getContext('2d');
      const imageData = ctx!.createImageData(300, 300);
      imageData.data.set(pixels);
      ctx!.putImageData(imageData, 0, 0);
    } else {
      const [r, g, b] = getBlurHashAverageColor(this.appLoadBlur);

      this.renderer.setStyle(
        this.elRef.nativeElement,
        'background-color',
        `rgb(${r}, ${g}, ${b})`
      );
    }
  }

  ngAfterViewInit(): void {}
}
