import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  constructor() {}
  loginForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });
  http = inject(HttpClient);
  router = inject(Router);
  onSubmit() {
    const formValue = this.loginForm.value;
    this.http.post('https://fldemo.fivelumenstest.com/api/login', formValue).subscribe({
      next: (response: any) => {
        if (response.success) {
          localStorage.setItem('authToken', response.data.authorization);
          this.router.navigateByUrl('/dashboard');
          console.log('Login successful', response.data.authorization);
        } else {
          console.log('Login failed', response.message);
        }
      },
      error: (error) => {
        console.error('Login failed', error);
      },
    });
    console.log(this.loginForm.value);
    this.loginForm.reset();
  }
}
