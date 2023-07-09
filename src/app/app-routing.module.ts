import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NftComponent } from './mint/nft/nft.component';

const routes: Routes = [
  { component: NftComponent, path: 'nft/:id' },
  { path: '**', redirectTo: '/' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
