import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort} from '@angular/material';
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
    'remainQuantity', 'remainMoney', 'startedOn', 'endedOn', 'totalPeriod'];
  displayedValueColumns: string[] = ['stock', 'buyQuantity', 'buyAvgPrice', 'buyFee', 'buyMoney',
    'sellQuantity', 'sellAvgPrice', 'sellFee', 'sellTax', 'sellMoney',
    'remainQuantity', 'remainMoney', 'startedOn', 'endedOn', 'totalPeriod'];
  investmentPeriods: InvestmentPeriod[] = [];

  pageSize = 30;
  resultsLength = 0;
  isLoadingResults = true;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private investmentPeriodService: InvestmentPeriodService
  ) {}

  ngOnInit() {
    this.subscribeEvents();
  }

  private subscribeEvents() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.investmentPeriodService.index(this.paginator.pageIndex, this.pageSize);
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

  calculateRemainQuantity(row: InvestmentPeriod): number {
    return row.buyQuantity - row.sellQuantity;
  }

  calculateRemainMoney(row: InvestmentPeriod): number {
    return this.calculateRemainQuantity(row) * row.sellAvgPrice;
  }

  calculateTotalDays(row) {
    if (row.endedOn == null) {
      return null;
    }

    const start = moment(row.startedOn, 'YYYY-MM-DD');
    const end = moment(row.endedOn, 'YYYY-MM-DD');
    return end.diff(start, 'days') + 1;
  }
}
