import {Injectable} from '@angular/core';

import {ApiService} from './api.service';
import {ApiEndpoints} from './api-endpoints';
import {Logger} from '../../logger';
import {HttpParams} from '@angular/common/http';
import {InvestmentPeriod} from '../models/investment-period.model';
import {PageResponse} from '../models/page-response.model';
import {Observable} from 'rxjs';


@Injectable()
export class InvestmentPeriodService {
  constructor(
    private apiService: ApiService
  ) {
  }

  index(page: number, size: number): Observable<PageResponse<InvestmentPeriod>> {
    Logger.log(InvestmentPeriodService.name, `index: page=${page}, size=${size}`);

    const httpParams = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.apiService.get<PageResponse<InvestmentPeriod>>(ApiEndpoints.INVESTMENT_PERIODS, httpParams);
  }
}
