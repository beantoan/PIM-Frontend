import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {ApiService} from './api.service';
import {ApiEndpoints} from './api-endpoints';
import {Logger} from '../../logger';
import {TransactionType} from '../models/transaction-type.model';


@Injectable()
export class TransactionService {
  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) {
  }

  getTypes() {
    Logger.log('getTypes');

    return this.apiService.get<TransactionType[]>(ApiEndpoints.TRANSACTIONS_TYPES);
  }
}
