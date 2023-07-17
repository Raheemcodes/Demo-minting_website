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
import { ModalComponent } from './modal/modal.component';
import { ErrorMsgComponent } from './error-msg/error-msg.component';
import { environment } from 'src/environments/environment.development';

@NgModule({
  declarations: [
    AppComponent,
    MintComponent,
    HeaderComponent,
    NftComponent,
    ModalComponent,
    ErrorMsgComponent,
  ],
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
      useValue: new Web3(
        `https://sepolia.infura.io/v3/${environment.INFURA_API_KEY}`
      ),
    },
  ],

  bootstrap: [AppComponent],
})
export class AppModule {}
