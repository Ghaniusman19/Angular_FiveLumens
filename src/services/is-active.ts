import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class IsActive {
  apiURL = 'https://fldemo.fivelumenstest.com/api/auth/coaching-forms/all?isActive=true';
  constructor(private http: HttpClient) {}

  isActiveData(authkey: string): Observable<any[]> {
    const headers = new HttpHeaders({
      // 'Content-Type': 'application/json',
      Authorization: `Bearer ${authkey}`,
    });
    return this.http.get<any[]>(this.apiURL, { headers });
  }
}
