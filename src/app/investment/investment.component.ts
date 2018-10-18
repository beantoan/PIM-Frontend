import {Component, NgModule, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
  MatProgressBarModule,
  MatRadioModule,
  MatSnackBarModule,
  MatTableModule
} from '@angular/material';
import {InvestmentPeriod} from '../core/models/investment-period.model';
import {InvestmentPeriodService} from '../core/services/investment-period.service';
import {BehaviorSubject, merge} from 'rxjs';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {TransactionService} from '../core/services/transaction.service';
import {Transaction} from '../core/models/transaction.model';
import {PageResponse} from '../core/models/page-response.model';
import {TransactionDialogComponent} from '../transaction-dialog/transaction-dialog.component';
import {Logger} from '../core/services/logger';
import {TransactionType} from '../core/models/transaction-type.model';
import {ActivatedRoute} from '@angular/router';
import {FlexLayoutModule} from '@angular/flex-layout';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppEventEmitter} from '../core/services/app-event-emitter.service';
import {CoreModule} from '../core/core.module';

export class LoadTransitionsParam {

  investmentPeriod: InvestmentPeriod;
  pageIndex: number;
  isShowLoading: boolean;

  constructor(investmentPeriod: InvestmentPeriod, pageIndex: number, isShowLoading: boolean) {
    this.investmentPeriod = investmentPeriod;
    this.pageIndex = pageIndex;
    this.isShowLoading = isShowLoading;
  }
}

export class LoadInvestmentPeriodsParam {
  pageIndex: number;
  groupType: number;
  viewType: number;

  constructor(pageIndex: number, groupType: number, viewType: number) {
    this.pageIndex = pageIndex;
    this.groupType = groupType;
    this.viewType = viewType;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.css'],
  animations: [
    trigger('expandedTransactions', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden', display: 'none'})),
      state('expanded', style({ height: '*', visibility: 'visible', display: '' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class InvestmentComponent implements OnInit, OnDestroy {
  VIEW_TYPES = {
    TRADING: 1,
    FINISHED: 2,
    ALL: 3
  };

  GROUP_TYPES = {
    PERIOD: 1,
    AGGREGATE: 2
  };

  investmentPeriods: PageResponse<InvestmentPeriod> = new PageResponse<InvestmentPeriod>();
  transactionPageResponses: {[key: number]: PageResponse<Transaction>} = {};

  investmentPeriodPageSize = 30;
  transactionPageSize = 20;
  isLoadingInvestmentPeriods = true;
  isLoadingTransactions: {[key: number]: boolean} = {};

  transactionTypes: TransactionType[] = [];

  private expandedInvestmentPeriod: BehaviorSubject<InvestmentPeriod> = new BehaviorSubject(null);
  private reloadInvestmentPeriods: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private reloadTransactions: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private loadInvestmentPeriodsParams: BehaviorSubject<LoadInvestmentPeriodsParam> = new BehaviorSubject(null);
  private loadTransitionsParams: BehaviorSubject<LoadTransitionsParam> = new BehaviorSubject(null);

  @ViewChild('investmentPeriodsPaginator') investmentPeriodsPaginator: MatPaginator;

  constructor(
    private transactionService: TransactionService,
    private appEventEmitter: AppEventEmitter,
    public investmentPeriodService: InvestmentPeriodService,
    public createTransactionDialog: MatDialog,
    public activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadInvestmentPeriodsParams.next(this.buildLoadInvestmentPeriodsParam());

    this.subscribeEvents();
  }

  ngOnDestroy() {
    this.unsubscribeEvents();
  }

  private buildLoadInvestmentPeriodsParam() {
    return new LoadInvestmentPeriodsParam(this.investmentPeriodsPaginator.pageIndex, this.getGroupType(), this.getViewType());
  }

  private unsubscribeEvents() {
    this.expandedInvestmentPeriod.unsubscribe();
    this.reloadTransactions.unsubscribe();
    this.investmentPeriodsPaginator.page.unsubscribe();
    this.reloadInvestmentPeriods.unsubscribe();
    this.loadInvestmentPeriodsParams.unsubscribe();
  }

  private subscribeEvents() {
    merge(this.activatedRoute.params, this.investmentPeriodsPaginator.page, this.reloadInvestmentPeriods)
      .subscribe(event => {
        this.loadInvestmentPeriodsParams.next(this.buildLoadInvestmentPeriodsParam());
      });

    this.loadInvestmentPeriodsParams.subscribe(params => {
      this.loadInvestmentPeriods(params);
    });

    this.loadTransitionsParams.subscribe(param => {
      this.loadTransitionPage(param);
    });

    this.expandedInvestmentPeriod.subscribe(row => {
      this.loadTransitionsParams.next(new LoadTransitionsParam(row, 0, true));
    });

    this.transactionService.getTypes().subscribe(data => {
      this.transactionTypes = data;
    });

    this.reloadTransactions.subscribe(data => {
      this.loadTransitionsParams.next(new LoadTransitionsParam(this.expandedInvestmentPeriod.value, 0, false));
    });

    this.appEventEmitter.onTransactionDialogClosed.subscribe(data => {
      this.reloadDataAfterCreateOrEditTransaction(data);
    });
  }

  private loadInvestmentPeriods(param: LoadInvestmentPeriodsParam) {
    Logger.info(InvestmentComponent.name, 'loadInvestmentPeriods', param);

    if (param) {
      this.isLoadingInvestmentPeriods = true;

      if (this.getGroupType() === this.GROUP_TYPES.PERIOD) {
        this.investmentPeriodService
          .periods(param.pageIndex, this.investmentPeriodPageSize, param.viewType)
          .subscribe(data => {
            this.investmentPeriods = data;
            this.isLoadingInvestmentPeriods = false;
          }, err => {
            this.isLoadingInvestmentPeriods = false;

            this.investmentPeriods = new PageResponse<InvestmentPeriod>();
          });
      } else {
        this.investmentPeriodService.aggregates(param.pageIndex, this.investmentPeriodPageSize)
          .subscribe(data => {
            this.investmentPeriods = data;
            this.isLoadingInvestmentPeriods = false;
          }, err => {
            this.isLoadingInvestmentPeriods = false;
            this.investmentPeriods = new PageResponse<InvestmentPeriod>();
          });
      }
    }
  }

  private showTransactionDialog(row: InvestmentPeriod, transaction: Transaction) {
    Logger.info(InvestmentComponent.name, 'showEditTransactionDialog',
      `stockCode=${row.stock.code}, transactionId=${transaction.id}`);

    const dialogRef = this.createTransactionDialog.open(TransactionDialogComponent, {
      width: '600px',
      autoFocus: true,
      data: transaction
    });

    dialogRef.afterClosed().subscribe(result => {
      Logger.info(InvestmentComponent.name, 'showTransactionDialog',
        'dialog is closed', result);

      this.reloadDataAfterCreateOrEditTransaction(result);
    });
  }

  /**
   * Load transactions for an investment period
   */
  private loadTransitionPage(param: LoadTransitionsParam) {
    if (param && param.investmentPeriod) {
      if (param.isShowLoading) {
        this.isLoadingTransactions[param.investmentPeriod.id] = true;
      }

      if (!this.transactionPageResponses[param.investmentPeriod.id]) {
        this.transactionPageResponses[param.investmentPeriod.id] = new PageResponse<Transaction>();
      }

      this.transactionService
        .index(param.pageIndex, this.transactionPageSize, param.investmentPeriod)
        .subscribe(data => {
          this.transactionPageResponses[param.investmentPeriod.id] = data;
        }, err => {
          this.isLoadingTransactions[param.investmentPeriod.id] = false;
          this.transactionPageResponses[param.investmentPeriod.id] = new PageResponse<Transaction>();
        }, () => {
          this.isLoadingTransactions[param.investmentPeriod.id] = false;
        });
    }
  }

  private reloadDataAfterCreateOrEditTransaction(result) {
    Logger.info(InvestmentComponent.name, 'reloadDataAfterCreateOrEditTransaction', result);

    if (result) {
      this.reloadInvestmentPeriods.next(true);
      this.reloadTransactions.next(true);
    }
  }

  isRowExpanded(row: InvestmentPeriod) {
    return this.expandedInvestmentPeriod.value && this.expandedInvestmentPeriod.value.id === row.id;
  }

  canAddTransaction(row: InvestmentPeriod) {

    if (row.endedOn == null || this.getGroupType() === this.GROUP_TYPES.AGGREGATE) {
      return true;
    }

    const holdQuantity = row.buyQuantity - row.sellQuantity;

    return holdQuantity > 0 && holdQuantity <= row.dividendQuantity;
  }

  canEditTransaction(row: InvestmentPeriod) {
    return this.getGroupType() === this.GROUP_TYPES.PERIOD && row.endedOn == null;
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

  onTransactionPaginatorChanged(row: InvestmentPeriod, pageIndex: number) {
    this.loadTransitionsParams.next(new LoadTransitionsParam(row, pageIndex, true));
  }

  getGroupType() {
    return Number(this.activatedRoute.snapshot.params['groupType']);
  }

  getViewType() {
    const viewType = this.activatedRoute.snapshot.params['viewType'];
    return viewType ? Number(viewType) : 0;
  }

  calcFullColspan() {
    return 19;
  }

  calTradingTimeColspan() {
    switch (this.getViewType()) {
      case this.VIEW_TYPES.TRADING:
        return 1;
      case this.VIEW_TYPES.FINISHED:
        return 3;
      default:
        return 3;
    }
  }

  calcDisplayedColumns() {
    const displayedTradingValueColumns = ['stock', 'buyQuantity', 'buyAvgPrice', 'buyFee', 'buyMoney',
      'sellQuantity', 'sellAvgPrice', 'sellFee', 'sellTax', 'sellMoney',
      'holdQuantity', 'latestPrice', 'holdMoney', 'netRevenue', 'grossRevenue', 'roiPercentage',
      'startedOn'];
    const displayedFinishedValueColumns = ['stock', 'buyQuantity', 'buyAvgPrice', 'buyFee', 'buyMoney',
      'sellQuantity', 'sellAvgPrice', 'sellFee', 'sellTax', 'sellMoney',
      'holdQuantity', 'latestPrice', 'holdMoney', 'netRevenue', 'grossRevenue', 'roiPercentage',
      'startedOn', 'endedOn', 'totalPeriod'];
    const displayedValueColumns = ['stock', 'buyQuantity', 'buyAvgPrice', 'buyFee', 'buyMoney',
      'sellQuantity', 'sellAvgPrice', 'sellFee', 'sellTax', 'sellMoney',
      'holdQuantity', 'latestPrice', 'holdMoney', 'netRevenue', 'grossRevenue', 'roiPercentage',
      'startedOn', 'endedOn', 'totalPeriod'];

    switch (this.getViewType()) {
      case this.VIEW_TYPES.TRADING:
        return displayedTradingValueColumns;
      case this.VIEW_TYPES.FINISHED:
        return displayedFinishedValueColumns;
      default:
        return displayedValueColumns;
    }
  }

  calcDisplayedSubHeaderColumns() {
    const displayedSubHeaderColumns = ['buyQuantity', 'buyAvgPrice', 'buyFee', 'buyMoney',
      'sellQuantity', 'sellAvgPrice', 'sellFee', 'sellTax', 'sellMoney',
      'holdQuantity', 'latestPrice', 'holdMoney', 'netRevenue', 'grossRevenue', 'roiPercentage',
      'startedOn', 'endedOn', 'totalPeriod'];
    const displayedFinishedSubHeaderColumns = ['buyQuantity', 'buyAvgPrice', 'buyFee', 'buyMoney',
      'sellQuantity', 'sellAvgPrice', 'sellFee', 'sellTax', 'sellMoney',
      'holdQuantity', 'latestPrice', 'holdMoney', 'netRevenue', 'grossRevenue', 'roiPercentage',
      'startedOn', 'endedOn', 'totalPeriod'];
    const displayedTradingSubHeaderColumns = ['buyQuantity', 'buyAvgPrice', 'buyFee', 'buyMoney',
      'sellQuantity', 'sellAvgPrice', 'sellFee', 'sellTax', 'sellMoney',
      'holdQuantity', 'latestPrice', 'holdMoney', 'netRevenue', 'grossRevenue', 'roiPercentage',
      'startedOn'];

    switch (this.getViewType()) {
      case this.VIEW_TYPES.TRADING:
        return displayedTradingSubHeaderColumns;
      case this.VIEW_TYPES.FINISHED:
        return displayedFinishedSubHeaderColumns;
      default:
        return displayedSubHeaderColumns;
    }
  }

  calcDisplayedHeaderColumns() {
    const displayedHeaderColumns = ['stock', 'buyColumns', 'sellColumns', 'holdColumns', 'revenueColumns', 'tradingTimeColumns'];
    const displayedFinishedHeaderColumns = ['stock', 'buyColumns', 'sellColumns', 'holdColumns', 'revenueColumns', 'tradingTimeColumns'];

    switch (this.getViewType()) {
      case this.VIEW_TYPES.TRADING:
        return displayedHeaderColumns;
      case this.VIEW_TYPES.FINISHED:
        return displayedFinishedHeaderColumns;
      default:
        return displayedHeaderColumns;
    }
  }

  calcDisplayedTransactionColumns() {
    const displayedTransactionColumns = ['type', 'quantity', 'price', 'money', 'fee', 'tax', 'transactedOn', 'editTransaction'];

    return displayedTransactionColumns;
  }

  calcTotalFeesForInvestmentPeriod(row: InvestmentPeriod) {
    if (this.transactionPageResponses && this.transactionPageResponses[row.id] && this.transactionPageResponses[row.id].content) {
      return this.transactionPageResponses[row.id].content
        .map(item => item.fee + item.tax)
        .reduce((acc, value) => acc + value, 0);
    }

    return 0;
  }
}

@NgModule({
  imports: [
    CoreModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatDividerModule,
    MatRadioModule,
    MatSnackBarModule,
    MatProgressBarModule,
    FlexLayoutModule
  ],
  exports: [InvestmentComponent],
  declarations: [
    InvestmentComponent
  ],
})
export class InvestmentPeriodModule {
}
