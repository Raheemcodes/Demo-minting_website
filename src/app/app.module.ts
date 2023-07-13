import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { MintComponent } from './mint/mint.component';
import { NftComponent } from './mint/nft/nft.component';
import { ErrorSvgComponent } from './shared/error-svg/error-svg.component';

import Web3 from 'web3';

@NgModule({
  declarations: [AppComponent, MintComponent, HeaderComponent, NftComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ErrorSvgComponent,
    HttpClientModule,
  ],
  providers: [
    { provide: 'Window', useValue: window },
    {
      provide: 'Web3',
      useValue: new Web3(Web3.givenProvider),
    },
  ],

  bootstrap: [AppComponent],
})
export class AppModule {}
