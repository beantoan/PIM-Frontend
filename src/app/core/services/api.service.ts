import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
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

  get<T>(path: string, params: HttpParams = new HttpParams()): Observable<T> {
    const url = this.buildUrl(path);

    return this.http.get<T>(url, {params})
      .pipe(catchError(this.formatErrors));
  }

  put<T>(path: string, body: Object = {}): Observable<T> {
    const url = this.buildUrl(path);

    return this.http.put<T>(
      url, JSON.stringify(body)
    ).pipe(catchError(this.formatErrors));
  }

  post<T>(path: string, data: Object = {}): Observable<T> {
    const url = this.buildUrl(path);
    const body = this.buildFormData(data);

    return this.http.post<T>(url, body).pipe(catchError(this.formatErrors));
  }

  delete<T>(path): Observable<T> {
    const url = this.buildUrl(path);

    return this.http.delete<T>(url).pipe(catchError(this.formatErrors));
  }
}
