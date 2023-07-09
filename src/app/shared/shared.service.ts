import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { Card, MetaInterface } from './shared.mdel';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  constructor(private meta: Meta, private titleService: Title) {}

  setMeta({ title, description, img, path, keywords }: MetaInterface) {
    this.titleService.setTitle(title);

    if (environment.production) {
      this.meta.updateTag({
        name: 'description',
        content: description,
      });
      this.meta.updateTag({
        name: 'keywords',
        content: keywords,
      });
      this.createCard({ title, description, img, path });
    }
  }

  createCard({ title, description, img, path }: Card) {
    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.meta.updateTag({
      property: 'og:type',
      content: 'website',
    });
    this.meta.updateTag({
      property: 'og:url',
      content: environment.frontendAddress + path,
    });
    this.meta.updateTag({
      property: 'og:title',
      content: title,
    });
    this.meta.updateTag({
      property: 'og:description',
      content: description,
    });
    this.meta.updateTag({
      property: 'og:image',
      content: environment.frontendAddress + '/assets/background/' + img,
    });
  }
}
