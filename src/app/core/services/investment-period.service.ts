import {Injectable} from '@angular/core';

import {ApiService} from './api.service';
import {ApiEndpoints} from './api-endpoints';
import {Logger} from './logger';
import {HttpParams} from '@angular/common/http';
import {InvestmentPeriod} from '../models/investment-period.model';
import {PageResponse} from '../models/page-response.model';
import {Observable} from 'rxjs';
import * as moment from 'moment';


@Injectable()
export class InvestmentPeriodService {
  constructor(
    private apiService: ApiService
  ) {
  }

  periods(page: number, size: number, view: number): Observable<PageResponse<InvestmentPeriod>> {
    Logger.info(InvestmentPeriodService.name, 'periods', `page=${page}, size=${size}, view=${view}`);

    const httpParams = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('view', view.toString());

    return this.apiService.get<PageResponse<InvestmentPeriod>>(ApiEndpoints.INVESTMENT_PERIODS, httpParams);
  }

  aggregates(page: number, size: number): Observable<PageResponse<InvestmentPeriod>> {
    Logger.info(InvestmentPeriodService.name, 'aggregates', `page=${page}, size=${size}`);

    const httpParams = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.apiService.get<PageResponse<InvestmentPeriod>>(ApiEndpoints.INVESTMENT_AGGREGATES, httpParams);
  }

  calcHoldQuantity(row: InvestmentPeriod): number {
    return row.buyQuantity - row.sellQuantity;
  }

  calcHoldMoney(row: InvestmentPeriod): number {
    return this.calcHoldQuantity(row) * row.stock.price * 1000;
  }

  calcTotalDays(row: InvestmentPeriod): number {
    if (row.endedOn == null) {
      return null;
    }

    const start = moment(row.startedOn, 'YYYY-MM-DD');
    const end = moment(row.endedOn, 'YYYY-MM-DD');
    return end.diff(start, 'days') + 1;
  }

  calcTotalFees(row: InvestmentPeriod): number {
    return row.buyFee + row.sellFee + row.sellTax + row.cashAdvanceFee;
  }

  calcNetRevenue(row: InvestmentPeriod): number {
    return row.sellQuantity * (row.sellAvgPrice - row.buyAvgPrice) - this.calcTotalFees(row);
  }

  calcGrossRevenue(row: InvestmentPeriod): number {
    return row.sellMoney - row.buyMoney - this.calcTotalFees(row);
  }

  calcROIPercentage(row: InvestmentPeriod): number {
    if (row.sellQuantity > 0) {
      const capital = row.sellQuantity * row.buyAvgPrice;

      return Math.round((this.calcNetRevenue(row) / capital) * 10000) / 100;
    }
  }

  getTotalBuyFee(investmentPeriods: InvestmentPeriod[]) {
    if (investmentPeriods) {
      return investmentPeriods
        .map(item => item.buyFee)
        .reduce((acc, value) => acc + value, 0);
    }

    return 0;
  }

  getTotalSellFee(investmentPeriods: InvestmentPeriod[]) {
    if (investmentPeriods) {
      return investmentPeriods
        .map(item => item.sellFee)
        .reduce((acc, value) => acc + value, 0);
    }

    return 0;
  }

  getTotalSellTax(investmentPeriods: InvestmentPeriod[]) {
    if (investmentPeriods) {
      return investmentPeriods
        .map(item => item.sellTax)
        .reduce((acc, value) => acc + value, 0);
    }

    return 0;
  }

  getTotalSellMoney(investmentPeriods: InvestmentPeriod[]) {
    if (investmentPeriods) {
      return investmentPeriods
        .map(item => item.sellMoney)
        .reduce((acc, value) => acc + value, 0);
    }

    return 0;
  }

  getTotalNetRevenue(investmentPeriods: InvestmentPeriod[]) {
    if (investmentPeriods) {
      return investmentPeriods
        .map(item => this.calcNetRevenue(item))
        .reduce((acc, value) => acc + value, 0);
    }

    return 0;
  }

  getTotalGrossRevenue(investmentPeriods: InvestmentPeriod[]) {
    if (investmentPeriods) {
      return investmentPeriods
        .map(item => this.calcGrossRevenue(item))
        .reduce((acc, value) => acc + value, 0);
    }

    return 0;
  }

  getTotalBuyMoney(investmentPeriods: InvestmentPeriod[]) {
    if (investmentPeriods) {
      return investmentPeriods
        .map(item => item.buyMoney)
        .reduce((acc, value) => acc + value, 0);
    }

    return 0;
  }

  getTotalROIPercentage(investmentPeriods: InvestmentPeriod[]) {
    return Math.round((this.getTotalNetRevenue(investmentPeriods) / this.getTotalBuyMoney(investmentPeriods)) * 10000) / 100;
  }

  getTotalHoldMoney(investmentPeriods: InvestmentPeriod[]) {
    if (investmentPeriods) {
      return investmentPeriods
        .map(item => this.calcHoldMoney(item))
        .reduce((acc, value) => acc + value, 0);
    }

    return 0;
  }

  getTotalFees(investmentPeriods: InvestmentPeriod[]) {
    if (investmentPeriods) {
      return investmentPeriods
        .map(item => this.calcTotalFees(item))
        .reduce((acc, value) => acc + value, 0);
    }

    return 0;
  }
}
