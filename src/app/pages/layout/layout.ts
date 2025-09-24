import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [ RouterLink],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  router = inject(Router);
  constructor() {}
  OnLogOut() {
    localStorage.removeItem('authToken');
    this.router.navigateByUrl('/login');
  }
}
