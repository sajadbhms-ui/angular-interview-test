import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly loginUrl =
    'http://test-demo.aemenersol.com/api/account/login';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<string> {
    return this.http.post(
      this.loginUrl,
      { username, password },
      { responseType: 'text' }
    );
  }
}