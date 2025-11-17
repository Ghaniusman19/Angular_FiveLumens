import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Addscorecard {
  private ADDSCORECARDAPIURL = 'https://fldemo.fivelumenstest.com/api/auth/scorecards/add';
  private DELSCORECARDAPIURL = 'https://fldemo.fivelumenstest.com/api/auth/scorecards/delete';
  private EDITSCORECARDAPIURL = 'https://fldemo.fivelumenstest.com/api/auth/scorecards/edit';

  constructor(private http: HttpClient) {}
  AddScoreCard(data: any, authToken: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authToken}`, //
    });
    return this.http.post(this.ADDSCORECARDAPIURL, data, { headers });
  }
  Deletescorecard(data: any, authToken: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authToken}`, //
    });
    return this.http.post(this.DELSCORECARDAPIURL, data, { headers });
  }
  EditScoreCard(data: any, authToken: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authToken}`,
    });
    return this.http.post(this.EDITSCORECARDAPIURL, data, { headers });
  }
}
