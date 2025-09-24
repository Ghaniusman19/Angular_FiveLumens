import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FetchAPIData {
  private apiUrl = 'https://fldemo.fivelumenstest.com/api/auth/groups/all';
  // private authToken = localStorage.getItem('authToken');
  constructor(private http: HttpClient) {}

  fetchGroupsData(authkey: string): Observable<any[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authkey}`,
    });
    return this.http.get<any[]>(this.apiUrl, { headers });
  }
}
