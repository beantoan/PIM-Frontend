import {Component, NgModule, OnInit, ViewChild} from '@angular/core';
import {
  MatButtonModule,
  MatCardModule,
  MatDialog,
  MatDividerModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatPaginator,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatRadioGroup,
  MatRadioModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule
} from '@angular/material';
import {InvestmentPeriod} from '../core/models/investment-period.model';
import {InvestmentPeriodService} from '../core/services/investment-period.service';
import {BehaviorSubject, merge, of} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import * as moment from 'moment';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {TransactionService} from '../core/services/transaction.service';
import {Transaction} from '../core/models/transaction.model';
import {PageResponse} from '../core/models/page-response.model';
import {TransactionDialogComponent} from '../transaction-dialog/transaction-dialog.component';
import {Logger} from '../core/services/logger';
import {TransactionType} from '../core/models/transaction-type.model';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

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
  VIEW_TYPES = {
    TRADING: 1,
    FINISHED: 2,
    ALL: 3
  };

  investmentPeriodPageResponse: PageResponse<InvestmentPeriod> = new PageResponse<InvestmentPeriod>();
  transactionPageResponses: {[key: number]: PageResponse<Transaction>} = {};

  investmentPeriodPageSize = 50;
  transactionPageSize = 20;
  isLoadingInvestmentPeriods = true;
  isLoadingTransactions: {[key: number]: boolean} = {};

  transactionTypes: TransactionType[] = [];

  private expandedInvestmentPeriod: BehaviorSubject<InvestmentPeriod> = new BehaviorSubject(null);
  private reloadInvestmentPeriods: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private reloadTransactions: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @ViewChild('investmentPeriodsPaginator') investmentPeriodsPaginator: MatPaginator;
  @ViewChild(MatRadioGroup) viewType: MatRadioGroup;

  constructor(
    private investmentPeriodService: InvestmentPeriodService,
    private transactionService: TransactionService,
    public createTransactionDialog: MatDialog,
    public activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.subscribeEvents();
  }

  private subscribeEvents() {
    merge(this.activatedRoute.paramMap, this.investmentPeriodsPaginator.page, this.reloadInvestmentPeriods)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingInvestmentPeriods = true;

          return this.investmentPeriodService
            .index(this.investmentPeriodsPaginator.pageIndex, this.investmentPeriodPageSize, this.getViewType());
        }),
        map(data => {
          this.isLoadingInvestmentPeriods = false;

          return data;
        }),
        catchError(() => {
          this.isLoadingInvestmentPeriods = false;
          return of(new PageResponse<InvestmentPeriod>());
        })
      ).subscribe(data => {
        this.investmentPeriodPageResponse = data;
    });

    this.expandedInvestmentPeriod.subscribe(row => {
      this.loadTransitionPage(row, 0, true);
    });

    this.transactionService.getTypes().subscribe(data => {
      this.transactionTypes = data;
    });

    this.reloadTransactions.subscribe(data => {
      this.loadTransitionPage(this.expandedInvestmentPeriod.value, 0, false);
    });
  }

  private showTransactionDialog(row: InvestmentPeriod, transaction: Transaction) {
    Logger.log(InvestmentPeriodComponent.name, `showEditTransactionDialog: stockCode=${row.stock.code}, transactionId=${transaction.id}`);

    const dialogRef = this.createTransactionDialog.open(TransactionDialogComponent, {
      autoFocus: true,
      data: transaction
    });

    dialogRef.afterClosed().subscribe(result => {
      Logger.log(InvestmentPeriodComponent.name, 'dialog is closed');
      Logger.log(InvestmentPeriodComponent.name, result);

      if (result) {
        this.reloadInvestmentPeriods.next(true);
        this.reloadTransactions.next(true);
      }
    });
  }

  /**
   * Load transactions for an investment period
   * @param row
   * @param pageIndex
   * @param isShowLoading
   */
  loadTransitionPage(row: InvestmentPeriod, pageIndex: number, isShowLoading: boolean) {
    if (row) {
      if (isShowLoading) {
        this.isLoadingTransactions[row.id] = true;
      }

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

  calcTotalFees(row: InvestmentPeriod): number {
    return row.buyFee + row.sellFee + row.sellTax;
  }

  calcNetRevenue(row: InvestmentPeriod): number {
    return row.sellQuantity * (row.sellAvgPrice - row.buyAvgPrice) - this.calcTotalFees(row);
  }

  calcGrossRevenue(row: InvestmentPeriod): number {
    return row.sellMoney - row.buyMoney - this.calcTotalFees(row);
  }

  calcROIPercentage(row: InvestmentPeriod): number {
    if (row.sellQuantity > 0) {
      const capital = row.sellQuantity * row.sellAvgPrice;

      return Math.round((this.calcNetRevenue(row) / capital) * 10000) / 100;
    }
  }

  isRowExpanded(row: InvestmentPeriod) {
    return this.expandedInvestmentPeriod.value && this.expandedInvestmentPeriod.value.id === row.id;
  }

  isTransactionEditable(row: InvestmentPeriod) {
    return row.endedOn == null;
  }

  getTransactionPageResponse(investmentPeriodId: number) {
    if (this.transactionPageResponses[investmentPeriodId]) {
      return this.transactionPageResponses[investmentPeriodId];
    } else {
      return new PageResponse<Transaction>();
    }
  }

  getTransactionType(transaction: Transaction) {
    for (const type of this.transactionTypes) {
      if (type.id === transaction.type) {
        return type.title;
      }
    }

    return transaction.type.toString();
  }

  onInvestmentPeriodRowClicked(row: InvestmentPeriod) {
    if (this.isRowExpanded(row)) {
      this.expandedInvestmentPeriod.next(null);
    } else {
      this.expandedInvestmentPeriod.next(row);
    }
  }

  onEditTransactionClicked(row: InvestmentPeriod, transaction: Transaction) {
    this.showTransactionDialog(row, transaction);
  }

  onCreateTransactionClicked(row: InvestmentPeriod) {
    const transaction = new Transaction();
    transaction.stock = row.stock;

    this.showTransactionDialog(row, transaction);
  }

  getViewType() {
    return this.activatedRoute.snapshot.params['viewType'];
  }

  getTotalBuyFee() {
    if (this.investmentPeriodPageResponse.content) {
      return this.investmentPeriodPageResponse.content
        .map(item => item.buyFee)
        .reduce((acc, value) => acc + value, 0);
    }

    return 0;
  }

  getTotalSellFee() {
    if (this.investmentPeriodPageResponse.content) {
      return this.investmentPeriodPageResponse.content
        .map(item => item.sellFee)
        .reduce((acc, value) => acc + value, 0);
    }

    return 0;
  }

  getTotalSellTax() {
    if (this.investmentPeriodPageResponse.content) {
      return this.investmentPeriodPageResponse.content
        .map(item => item.sellTax)
        .reduce((acc, value) => acc + value, 0);
    }

    return 0;
  }

  getTotalNetRevenue() {
    if (this.investmentPeriodPageResponse.content) {
      return this.investmentPeriodPageResponse.content
        .map(item => this.calcNetRevenue(item))
        .reduce((acc, value) => acc + value, 0);
    }

    return 0;
  }

  getTotalGrossRevenue() {
    if (this.investmentPeriodPageResponse.content) {
      return this.investmentPeriodPageResponse.content
        .map(item => this.calcGrossRevenue(item))
        .reduce((acc, value) => acc + value, 0);
    }

    return 0;
  }

  getTotalBuyMoney() {
    if (this.investmentPeriodPageResponse.content) {
      return this.investmentPeriodPageResponse.content
        .map(item => item.buyMoney)
        .reduce((acc, value) => acc + value, 0);
    }

    return 0;
  }

  getTotalROIPercentage() {
    return Math.round((this.getTotalNetRevenue() / this.getTotalBuyMoney()) * 10000) / 100;
  }

  calcFullColspan() {
    switch (this.getViewType().toString()) {
      case '1':
        return 16;
      case '2':
        return 16;
      default:
        return 18;
    }
  }

  calTradingTimeColspan() {
    switch (this.getViewType().toString()) {
      case '1':
        return 1;
      case '2':
        return 3;
      default:
        return 3;
    }
  }

  calcDisplayedColumns() {
    const displayedTradingValueColumns = ['stock', 'buyQuantity', 'buyAvgPrice', 'buyFee', 'buyMoney',
      'sellQuantity', 'sellAvgPrice', 'sellFee', 'sellTax', 'sellMoney',
      'holdQuantity', 'holdMoney', 'netRevenue', 'grossRevenue', 'roiPercentage',
      'startedOn'];
    const displayedFinishedValueColumns = ['stock', 'buyQuantity', 'buyAvgPrice', 'buyFee', 'buyMoney',
      'sellQuantity', 'sellAvgPrice', 'sellFee', 'sellTax', 'sellMoney',
      'netRevenue', 'grossRevenue', 'roiPercentage',
      'startedOn', 'endedOn', 'totalPeriod'];
    const displayedValueColumns = ['stock', 'buyQuantity', 'buyAvgPrice', 'buyFee', 'buyMoney',
      'sellQuantity', 'sellAvgPrice', 'sellFee', 'sellTax', 'sellMoney',
      'holdQuantity', 'holdMoney', 'netRevenue', 'grossRevenue', 'roiPercentage',
      'startedOn', 'endedOn', 'totalPeriod'];

    switch (this.getViewType().toString()) {
      case '1':
        return displayedTradingValueColumns;
      case '2':
        return displayedFinishedValueColumns;
      default:
        return displayedValueColumns;
    }
  }

  calcDisplayedSubHeaderColumns() {
    const displayedSubHeaderColumns = ['buyQuantity', 'buyAvgPrice', 'buyFee', 'buyMoney',
      'sellQuantity', 'sellAvgPrice', 'sellFee', 'sellTax', 'sellMoney',
      'holdQuantity', 'holdMoney', 'netRevenue', 'grossRevenue', 'roiPercentage',
      'startedOn', 'endedOn', 'totalPeriod'];
    const displayedFinishedSubHeaderColumns = ['buyQuantity', 'buyAvgPrice', 'buyFee', 'buyMoney',
      'sellQuantity', 'sellAvgPrice', 'sellFee', 'sellTax', 'sellMoney',
      'netRevenue', 'grossRevenue', 'roiPercentage',
      'startedOn', 'endedOn', 'totalPeriod'];
    const displayedTradingSubHeaderColumns = ['buyQuantity', 'buyAvgPrice', 'buyFee', 'buyMoney',
      'sellQuantity', 'sellAvgPrice', 'sellFee', 'sellTax', 'sellMoney',
      'holdQuantity', 'holdMoney', 'netRevenue', 'grossRevenue', 'roiPercentage',
      'startedOn'];

    switch (this.getViewType().toString()) {
      case '1':
        return displayedTradingSubHeaderColumns;
      case '2':
        return displayedFinishedSubHeaderColumns;
      default:
        return displayedSubHeaderColumns;
    }
  }

  calcDisplayedHeaderColumns() {
    const displayedHeaderColumns = ['stock', 'buyColumns', 'sellColumns', 'holdColumns', 'revenueColumns', 'tradingTimeColumns'];
    const displayedFinishedHeaderColumns = ['stock', 'buyColumns', 'sellColumns', 'revenueColumns', 'tradingTimeColumns'];

    switch (this.getViewType().toString()) {
      case '1':
        return displayedHeaderColumns;
      case '2':
        return displayedFinishedHeaderColumns;
      default:
        return displayedHeaderColumns;
    }
  }

  calcDisplayedTransactionColumns() {
    const displayedTransactionColumns = ['type', 'quantity', 'price', 'money', 'fee', 'tax', 'transactedOn', 'editTransaction'];

    return displayedTransactionColumns;
  }
}

@NgModule({
  imports: [
    RouterModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatRadioModule,
    MatSnackBarModule,
    FlexLayoutModule
  ],
  exports: [InvestmentPeriodComponent],
  declarations: [InvestmentPeriodComponent],
})
export class InvestmentPeriodModule {
}
