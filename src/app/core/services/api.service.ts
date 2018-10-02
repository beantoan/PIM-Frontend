import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';

import {JwtService} from './jwt.service';
import {catchError} from 'rxjs/operators';

@Injectable()
export class ApiService {
  constructor(
    private http: HttpClient,
    private jwtService: JwtService
  ) {
  }


  private formatErrors(error: any) {
    return throwError(error.error);
  }

  private buildAuthHeaders(token: string) {
    const auth = `Basic ${token}`;

    // return {
    //   'Content-Type' : 'application/x-www-form-urlencoded',
    //   'Authorization' : `Basic ${token}`
    // };

    return new HttpHeaders().set('Content-Type', 'application/form-data')
      .append('Authorization', auth);
  }

  private buildFormData(data: {}): FormData {

    const formData = new FormData();

    Object.keys(data).forEach(function (key) {
      formData.set(key, data[key]);
    });

    return formData;
  }

  private buildUrl(path: string) {
    return `${environment.apiUrl}${path}`;
  }

  get(path: string, params: HttpParams = new HttpParams()): Observable<any> {
    const url = this.buildUrl(path);

    return this.http.get(url, {params})
      .pipe(catchError(this.formatErrors));
  }

  put(path: string, body: Object = {}): Observable<any> {
    const url = this.buildUrl(path);

    return this.http.put(
      url, JSON.stringify(body)
    ).pipe(catchError(this.formatErrors));
  }

  post(path: string, data: Object = {}): Observable<any> {
    // const headers = this.buildAuthHeaders(this.apiToken);
    const url = this.buildUrl(path);
    const body = this.buildFormData(data);
    // const options = {
    //   headers: headers
    // };

    return this.http.post(url, body).pipe(catchError(this.formatErrors));
  }

  delete(path): Observable<any> {
    const url = this.buildUrl(path);

    return this.http.delete(url).pipe(catchError(this.formatErrors));
  }
}
