import {Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';

import {ApiService} from './api.service';
import {ApiEndpoints} from './api-endpoints';
import {Logger} from './logger';
import {TransactionType} from '../models/transaction-type.model';
import {Observable} from 'rxjs';
import {Transaction} from '../models/transaction.model';
import {InvestmentPeriod} from '../models/investment-period.model';
import {PageResponse} from '../models/page-response.model';


@Injectable()
export class TransactionService {
  constructor(
    private apiService: ApiService
  ) {
  }

  getTypes() {
    Logger.log(TransactionService.name, 'getTypes');

    return this.apiService.get<TransactionType[]>(ApiEndpoints.TRANSACTIONS_TYPES);
  }

  save(transaction: {}): Observable<Transaction> {
    Logger.log(TransactionService.name, 'save');

    return this.apiService.post<Transaction>(ApiEndpoints.TRANSACTIONS, transaction);
  }

  index(page: number, size: number, investmentPeriod: InvestmentPeriod): Observable<PageResponse<Transaction>> {
    Logger.log(TransactionService.name, `index: page=${page}, size=${size}, investmentPeriod=${investmentPeriod.id}`);

    const httpParams = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('investmentPeriodId', investmentPeriod.id.toString());

    return this.apiService.get<PageResponse<Transaction>>(ApiEndpoints.TRANSACTIONS, httpParams);
  }
}
