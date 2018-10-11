import {Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';

import {ApiService} from './api.service';
import {ApiEndpoints} from './api-endpoints';
import {Logger} from './logger';
import {Observable} from 'rxjs';
import {PageResponse} from '../models/page-response.model';
import {Topup} from '../models/topup.model';


@Injectable()
export class TopupService {
  constructor(
    private apiService: ApiService
  ) {
  }

  index(page: number, size: number): Observable<PageResponse<Topup>> {
    Logger.info(TopupService.name, 'index',
      `page=${page}, size=${size}`);

    const httpParams = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.apiService.get<PageResponse<Topup>>(ApiEndpoints.TOPUPS, httpParams);
  }

  create(topup: {}): Observable<Topup> {
    Logger.info(TopupService.name, 'create', topup);

    return this.apiService.post<Topup>(ApiEndpoints.TOPUPS, topup);
  }
}
