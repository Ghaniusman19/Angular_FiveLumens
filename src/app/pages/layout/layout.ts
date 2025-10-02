import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Calculator } from '../../../services/calculator';
import { Test } from '../../../services/test';

@Component({
  selector: 'app-layout',
  imports: [RouterLink],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  router = inject(Router);
  private calculator = inject(Calculator);
  totalCost = this.calculator.add(70, 30);
  private authKey = inject(Test);
  authkey = this.authKey.getToken();
  constructor() {}
  OnLogOut() {
    localStorage.removeItem('authToken');
    this.router.navigateByUrl('/login');
  }

  isVisible = signal(false);
  toggleModal() {
    this.isVisible.update((currentval) => !currentval);
  }
}
