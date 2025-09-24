import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class ScorecardData {
  private apiUrl = 'https://fldemo.fivelumenstest.com/api/auth/scorecards'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) {}

  scoreCardData(data: any, authToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`, // Add your authorization key here
    });

    return this.http.post(this.apiUrl, data, { headers });
  }
}
