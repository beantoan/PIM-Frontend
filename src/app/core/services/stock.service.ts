import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';

import {ApiService} from './api.service';
import {ApiEndpoints} from './api-endpoints';
import {Logger} from '../../logger';
import {Stock} from '../models/stock.model';


@Injectable()
export class StockService {
  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) {
  }

  search(term: string) {
    Logger.log(StockService.name, `search: ${term}`);

    const httpParams = new HttpParams().set('term', term);

    return this.apiService.get<Stock[]>(ApiEndpoints.STOCKS_SEARCH, httpParams);
  }
}
