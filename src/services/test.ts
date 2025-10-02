import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Test {
  getToken() {
    const authToken = localStorage.getItem('authToken');
    console.log('hello how are you !', authToken);
    return authToken;
  }
  getName() {
    const myname = 'Muhammad Usman Ghani';
    return myname;
  }

  getNumbers(name: string, age: number) {
    return 'My name is ' + name + ' ' + 'and my age is ' + age;
  }
}
