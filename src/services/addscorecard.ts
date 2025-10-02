import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Addscorecard {
  private apiUrl = 'https://fldemo.fivelumenstest.com/api/auth/scorecards/add';

  constructor(private http: HttpClient) {}
  AddScoreCard(data: any, authToken: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authToken}`, //
    });
    return this.http.post(this.apiUrl, data, { headers });
  }
}
