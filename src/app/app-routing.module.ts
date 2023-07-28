import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarketplaceComponent } from './marketplace/marketplace.component';
import { MintComponent } from './mint/mint.component';
import { NftComponent } from './mint/nft/nft.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  {
    component: MintComponent,
    path: '',
    children: [{ component: NftComponent, path: 'nft/:id' }],
  },
  { component: MarketplaceComponent, path: 'marketplace' },
  { component: ProfileComponent, path: 'profile' },
  { path: '**', redirectTo: '/' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
