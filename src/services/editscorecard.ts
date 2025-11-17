import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class editscorecard {
  constructor(private http: HttpClient) {}
  private EDITAPIURL = 'https://fldemo.fivelumenstest.com/api/auth/scorecards/edit';
  private UPDATEAPIURL = 'https://fldemo.fivelumenstest.com/api/auth/scorecards/update';

  EditScoreCard(data: any, authToken: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authToken}`, //
    });
    return this.http.post(this.EDITAPIURL, data, { headers });
  }
}
