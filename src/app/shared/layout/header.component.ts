import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {User} from '../../core/models/user.model';
import {UserService} from '../../core/services/user.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {TransactionService} from '../../core/services/transaction.service';
import {StockService} from '../../core/services/stock.service';
import {Stock} from '../../core/models/stock.model';
import {Observable, of} from 'rxjs';
import {TransactionType} from '../../core/models/transaction-type.model';
import {distinctUntilChanged, startWith, switchMap} from 'rxjs/operators';
import {Logger} from '../../logger';
import * as moment from 'moment';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {MomentUtcDateAdapter} from '../moment-utc-date.adapter';

declare var AJS: any;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-layout-header',
  templateUrl: './header.component.html',
  providers: [
    {provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true }},
    {provide: DateAdapter, useClass: MomentUtcDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS},
  ],
})
export class HeaderComponent implements OnInit, AfterViewInit {
  currentUser: User;
  dialogId = 'add-transaction-dialog';
  isSubmitting = false;
  transactionForm: FormGroup;

  transactionTypes: Observable<TransactionType[]>;
  stocks: Observable<Stock[]>;

  @Input('title') title: string;

  constructor(
    private userService: UserService,
    private transactionService: TransactionService,
    private stockService: StockService
  ) {
  }

  ngOnInit() {
    this.subscribeEvents();
    this.buildTransactionForm();

    this.initData();
  }

  ngAfterViewInit() {
    this.initUI();
  }

  private subscribeEvents() {
    this.userService.currentUser.subscribe(
      (userData) => {
        this.currentUser = userData;
      }
    );
  }

  private initData() {
    this.transactionTypes = this.transactionService.getTypes();

    this.stocks = this.transactionForm.get('stock').valueChanges
      .pipe(
        startWith<string | Stock>(''),
        distinctUntilChanged(),
        switchMap((input: string) => {
          if (input && input.length === 3) {
            return this.stockService.search(input);
          }

          return of([]);
        })
      );
  }

  private buildTransactionForm() {
    const today = moment().format('YYYY-MM-DD');

    this.transactionForm = new FormGroup({
      stock: new FormControl('', Validators.required),
      quantity: new FormControl('', [Validators.required, Validators.min(0)]),
      price: new FormControl('', [Validators.required, Validators.min(0)]),
      type: new FormControl(1, Validators.required),
      transactedOn: new FormControl(today, Validators.required),
    });
  }

  private initUI() {
    this.hideDialog();
  }

  private getDialogId() {
    return `#${this.dialogId}`;
  }

  showDialog() {
    AJS.dialog2(this.getDialogId()).show();
  }

  hideDialog() {
    AJS.dialog2(this.getDialogId()).hide();
  }

  onClickCreateTransaction() {
    this.showDialog();
  }

  onClickSaveTransaction() {
    this.transactionService.save(this.transactionForm.value)
      .subscribe(
        data => {
          Logger.log(HeaderComponent.name, data);

          AJS.flag({
            type: 'success',
            close: 'auto',
            title: 'Thành công',
            body: 'Tạo giao dịch mới thành thành công',
          });
        },
        err => {
          Logger.log(HeaderComponent.name, err);

          AJS.flag({
            type: 'error',
            close: 'auto',
            title: 'Lỗi',
            body: 'Gặp lỗi khi tạo giao dịch. Hãy liên hệ với admin@pim.vn để được giúp đỡ.',
          });
        }
      );
  }

  displayStockOption(stock?: Stock): string | undefined {
    console.log(stock);
    return stock ? `${stock.code}-${stock.title}` : undefined;
  }
}
