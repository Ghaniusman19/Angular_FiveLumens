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
  private UPDATESCORECARDAPIURL = 'https://fldemo.fivelumenstest.com/api/auth/scorecards/update';
  private CLONESCORECARDAPIURL = 'https://fldemo.fivelumenstest.com/api/auth/scorecards/clone';
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
  UpdateScoreCard(payload: any, authToken: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authToken}`,
    });
    return this.http.post(this.UPDATESCORECARDAPIURL, payload, { headers });
  }
  CloneScoreCard(payload: any, authToken: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authToken}`,
    });
    return this.http.post(this.CLONESCORECARDAPIURL, payload, { headers });
  }
}
