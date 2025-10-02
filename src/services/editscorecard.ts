import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class editscorecard {
  private EDITAPIURL = 'https://fldemo.fivelumenstest.com/api/auth/scorecards/edit';
  constructor(private http: HttpClient) {}
  EditScoreCard(data: any, authToken: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authToken}`, //
    });
    return this.http.post(this.EDITAPIURL, data, { headers });
  }
}
