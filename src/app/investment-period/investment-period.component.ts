import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatRadioGroup} from '@angular/material';
import {InvestmentPeriod} from '../core/models/investment-period.model';
import {InvestmentPeriodService} from '../core/services/investment-period.service';
import {merge, of} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'app-root',
  templateUrl: './investment-period.component.html',
  styleUrls: ['./investment-period.component.css']
})
export class InvestmentPeriodComponent implements OnInit {

  displayedHeaderColumns: string[] = ['buyQuantity', 'buyAvgPrice', 'buyFee', 'buyMoney',
    'sellQuantity', 'sellAvgPrice', 'sellFee', 'sellTax', 'sellMoney',
    'holdQuantity', 'holdMoney', 'rawRevenue', 'realRevenue', 'revenueRate',
    'startedOn', 'endedOn', 'totalPeriod'];
  displayedValueColumns: string[] = ['stock', 'buyQuantity', 'buyAvgPrice', 'buyFee', 'buyMoney',
    'sellQuantity', 'sellAvgPrice', 'sellFee', 'sellTax', 'sellMoney',
    'holdQuantity', 'holdMoney', 'rawRevenue', 'realRevenue', 'revenueRate',
    'startedOn', 'endedOn', 'totalPeriod'];

  investmentPeriods: InvestmentPeriod[] = [];

  pageSize = 30;
  viewType = 1;
  resultsLength = 0;
  isLoadingResults = true;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatRadioGroup) radioGroup: MatRadioGroup;

  constructor(
    private investmentPeriodService: InvestmentPeriodService
  ) {}

  ngOnInit() {
    this.subscribeEvents();
  }

  private subscribeEvents() {
    merge(this.radioGroup.change, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          const viewType = this.radioGroup.value == null ? this.viewType : this.radioGroup.value;
          return this.investmentPeriodService.index(this.paginator.pageIndex, this.pageSize, viewType);
        }),
        map(data => {
          this.isLoadingResults = false;
          this.resultsLength = data.totalElements;

          return data.content;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return of([]);
        })
      ).subscribe(data => this.investmentPeriods = data);
  }

  calcHoldQuantity(row: InvestmentPeriod): number {
    return row.buyQuantity - row.sellQuantity;
  }

  calcHoldMoney(row: InvestmentPeriod): number {
    return this.calcHoldQuantity(row) * row.sellAvgPrice;
  }

  calcTotalDays(row: InvestmentPeriod): number {
    if (row.endedOn == null) {
      return null;
    }

    const start = moment(row.startedOn, 'YYYY-MM-DD');
    const end = moment(row.endedOn, 'YYYY-MM-DD');
    return end.diff(start, 'days') + 1;
  }

  calRawRevenue(row: InvestmentPeriod): number {
    return row.sellQuantity * (row.sellAvgPrice - row.buyAvgPrice);
  }

  calcRealRevenue(row: InvestmentPeriod): number {
    return row.sellMoney - row.buyMoney;
  }

  calcRateOfRawRevenue(row: InvestmentPeriod): number {
    if (row.buyAvgPrice > 0 && row.endedOn != null) {
      return Math.round(((row.sellAvgPrice - row.buyAvgPrice) / row.buyAvgPrice) * 100);
    }
  }
}
