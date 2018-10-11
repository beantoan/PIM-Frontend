import {Injectable} from '@angular/core';

import {ApiService} from './api.service';
import {ApiEndpoints} from './api-endpoints';
import {Logger} from './logger';
import {Stock} from '../models/stock.model';
import {HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';


@Injectable()
export class StockService {
  constructor(
    private apiService: ApiService
  ) {
  }

  search(term: string): Observable<Stock[]> {
    Logger.info(StockService.name, 'search', term);

    const httpParams = new HttpParams().set('term', term);

    return this.apiService.get<Stock[]>(ApiEndpoints.STOCKS_SEARCH, httpParams);
  }
}
