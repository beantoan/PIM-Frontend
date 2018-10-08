import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {ApiService} from './api.service';
import {ApiEndpoints} from './api-endpoints';
import {Logger} from './logger';
import {TransactionType} from '../models/transaction-type.model';
import {Observable} from 'rxjs';
import {Transaction} from '../models/transaction.model';


@Injectable()
export class TransactionService {
  constructor(
    private apiService: ApiService,
    private http: HttpClient
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
}
