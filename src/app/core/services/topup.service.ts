import {Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';

import {ApiService} from './api.service';
import {ApiEndpoints} from './api-endpoints';
import {Logger} from './logger';
import {Observable} from 'rxjs';
import {Transaction} from '../models/transaction.model';
import {InvestmentPeriod} from '../models/investment-period.model';
import {PageResponse} from '../models/page-response.model';
import {Topup} from '../models/topup.model';


@Injectable()
export class TopupService {
  constructor(
    private apiService: ApiService
  ) {
  }

  index(page: number, size: number, investmentPeriod: InvestmentPeriod): Observable<PageResponse<Transaction>> {
    Logger.info(TopupService.name, 'index',
      `page=${page}, size=${size}, investmentPeriod=${investmentPeriod.id}`);

    const httpParams = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('investmentPeriodId', investmentPeriod.id.toString());

    return this.apiService.get<PageResponse<Transaction>>(ApiEndpoints.TRANSACTIONS, httpParams);
  }

  create(topup: {}): Observable<Topup> {
    Logger.info(TopupService.name, 'create', topup);

    return this.apiService.post<Topup>(ApiEndpoints.TOPUPS, topup);
  }
}
