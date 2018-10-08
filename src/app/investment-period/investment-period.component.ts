import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatRadioGroup} from '@angular/material';
import {InvestmentPeriod} from '../core/models/investment-period.model';
import {InvestmentPeriodService} from '../core/services/investment-period.service';
import {BehaviorSubject, merge, of} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import * as moment from 'moment';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {TransactionService} from '../core/services/transaction.service';
import {Transaction} from '../core/models/transaction.model';
import {PageResponse} from '../core/models/page-response.model';

@Component({
  selector: 'app-root',
  templateUrl: './investment-period.component.html',
  styleUrls: ['./investment-period.component.css'],
  animations: [
    trigger('expandedTransactions', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden', display: 'none'})),
      state('expanded', style({ height: '*', visibility: 'visible', display: '' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class InvestmentPeriodComponent implements OnInit {

  displayedHeaderColumns: string[] = ['stock', 'buyColumns', 'sellColumns', 'holdColumns', 'revenueColumns', 'tradingTimeColumns'];
  displayedSubHeaderColumns: string[] = ['buyQuantity', 'buyAvgPrice', 'buyFee', 'buyMoney',
    'sellQuantity', 'sellAvgPrice', 'sellFee', 'sellTax', 'sellMoney',
    'holdQuantity', 'holdMoney', 'rawRevenue', 'realRevenue', 'revenueRate',
    'startedOn', 'endedOn', 'totalPeriod'];
  displayedValueColumns: string[] = ['stock', 'buyQuantity', 'buyAvgPrice', 'buyFee', 'buyMoney',
    'sellQuantity', 'sellAvgPrice', 'sellFee', 'sellTax', 'sellMoney',
    'holdQuantity', 'holdMoney', 'rawRevenue', 'realRevenue', 'revenueRate',
    'startedOn', 'endedOn', 'totalPeriod'];
  displayedTransactionColumns: string[] = ['type', 'quantity', 'price', 'money', 'fee', 'tax', 'transactedOn', 'editTransaction'];

  investmentPeriodPageResponse: PageResponse<InvestmentPeriod> = new PageResponse<InvestmentPeriod>();
  transactionPageResponses: {[key: number]: PageResponse<Transaction>} = {};

  investmentPeriodPageSize = 5;
  transactionPageSize = 2;
  viewType = 1;
  isLoadingInvestmentPeriods = true;
  isLoadingTransactions: {[key: number]: boolean} = {};

  private expandedInvestmentPeriod: BehaviorSubject<InvestmentPeriod> = new BehaviorSubject(null);

  @ViewChild('investmentPeriodsPaginator') investmentPeriodsPaginator: MatPaginator;
  @ViewChild(MatRadioGroup) radioGroup: MatRadioGroup;

  constructor(
    private investmentPeriodService: InvestmentPeriodService,
    private transactionService: TransactionService
  ) {}

  ngOnInit() {
    this.subscribeEvents();
  }

  private subscribeEvents() {
    merge(this.radioGroup.change, this.investmentPeriodsPaginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingInvestmentPeriods = true;
          const viewType = this.radioGroup.value == null ? this.viewType : this.radioGroup.value;

          return this.investmentPeriodService
            .index(this.investmentPeriodsPaginator.pageIndex, this.investmentPeriodPageSize, viewType);
        }),
        map(data => {
          this.isLoadingInvestmentPeriods = false;

          return data;
        }),
        catchError(() => {
          this.isLoadingInvestmentPeriods = false;
          return of(new PageResponse<InvestmentPeriod>());
        })
      ).subscribe(data => this.investmentPeriodPageResponse = data);

    this.expandedInvestmentPeriod.subscribe(row => {
      this.loadTransitionPage(row, 0);
    });
  }

  /**
   * Load transactions for an investment period
   * @param row
   * @param pageIndex
   */
  private loadTransitionPage(row: InvestmentPeriod, pageIndex: number) {
    if (row) {
      this.isLoadingTransactions[row.id] = true;

      if (!this.transactionPageResponses[row.id]) {
        this.transactionPageResponses[row.id] = new PageResponse<Transaction>();
      }

      this.transactionService
        .index(pageIndex, this.transactionPageSize, row)
        .subscribe(data => {
          this.transactionPageResponses[row.id] = data;
        }, err => {
          this.isLoadingTransactions[row.id] = false;
          this.transactionPageResponses[row.id] = new PageResponse<Transaction>();
        }, () => {
          this.isLoadingTransactions[row.id] = false;
        });
    }
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
    if (row.buyAvgPrice > 0 && row.sellAvgPrice > 0) {
      return Math.round(((row.sellAvgPrice - row.buyAvgPrice) / row.buyAvgPrice) * 100);
    }
  }

  onInvestmentPeriodRowClicked(row: InvestmentPeriod) {
    if (this.expandedInvestmentPeriod.value && this.expandedInvestmentPeriod.value === row) {
      this.expandedInvestmentPeriod.next(null);
    } else {
      this.expandedInvestmentPeriod.next(row);
    }
  }

  isRowExpanded(row: InvestmentPeriod) {
    return this.expandedInvestmentPeriod.value === row;
  }

  getTransactionPageResponse(investmentPeriodId: number) {
    if (this.transactionPageResponses[investmentPeriodId]) {
      return this.transactionPageResponses[investmentPeriodId];
    } else {
      return new PageResponse<Transaction>();
    }
  }
}
