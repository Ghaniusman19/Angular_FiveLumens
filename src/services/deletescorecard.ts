import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Deletescorecard {
  private delAPIURL = 'https://fldemo.fivelumenstest.com/api/auth/scorecards/delete';
  constructor(private http: HttpClient) {}
  Deletescorecard(data: any, authToken: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authToken}`, //
    });
    return this.http.post(this.delAPIURL, data, { headers });
  }
}
