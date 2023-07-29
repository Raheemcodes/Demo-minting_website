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
import { MarketplaceComponent } from './marketplace/marketplace.component';
import { ProfileComponent } from './profile/profile.component';
import { ApprovalModalComponent } from './approval-modal/approval-modal.component';
import { ListFormComponent } from './list-form/list-form.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    MintComponent,
    HeaderComponent,
    NftComponent,
    ModalComponent,
    ErrorMsgComponent,
    MarketplaceComponent,
    ProfileComponent,
    ApprovalModalComponent,
    ListFormComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ErrorSvgComponent,
    HttpClientModule,
    FormsModule,
  ],
  providers: [
    { provide: 'Window', useValue: window },
    {
      provide: 'Web3',
      useValue: new Web3(environment.provider),
    },
  ],

  bootstrap: [AppComponent],
})
export class AppModule {}
