import { inject } from '@angular/core';
import { CanActivateFn, UrlTree } from '@angular/router';
import { SharedService } from '../shared/shared.service';

export const profileGuard: CanActivateFn = (route, state): true | UrlTree => {
  return inject(SharedService).canActivate();
};
