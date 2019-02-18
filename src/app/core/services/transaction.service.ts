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
import {ApiResponse} from '../models/api-response.model';


@Injectable()
export class TransactionService {
  constructor(
    private apiService: ApiService
  ) {
  }

  getTypes() {
    Logger.info(TransactionService.name, 'getTypes()');

    return this.apiService.get<TransactionType[]>(ApiEndpoints.TRANSACTIONS_TYPES);
  }

  create(transaction: {}): Observable<ApiResponse> {
    Logger.info(TransactionService.name, 'create', transaction);

    return this.apiService.post<ApiResponse>(ApiEndpoints.TRANSACTIONS, transaction);
  }

  update(transaction: {}): Observable<ApiResponse> {
    Logger.info(TransactionService.name, 'update', transaction);

    return this.apiService.put<ApiResponse>(ApiEndpoints.TRANSACTIONS, transaction);
  }

  index(page: number, size: number, investmentPeriod: InvestmentPeriod): Observable<PageResponse<Transaction>> {
    Logger.info(TransactionService.name, 'index', `page=${page}, size=${size}, investmentPeriod=${investmentPeriod.id}`);

    const httpParams = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('investmentPeriodId', investmentPeriod.id.toString());

    return this.apiService.get<PageResponse<Transaction>>(ApiEndpoints.TRANSACTIONS, httpParams);
  }

  delete(transaction): Observable<ApiResponse> {
    Logger.info(TransactionService.name, 'delete', transaction);

    return this.apiService.delete<ApiResponse>(ApiEndpoints.TRANSACTIONS + '/' + transaction.id);
  }

  calcTotalFees(items: Transaction[]) {
    return items
      .map(item => item.fee + item.tax)
      .reduce((acc, value) => acc + value, 0);
  }
}
