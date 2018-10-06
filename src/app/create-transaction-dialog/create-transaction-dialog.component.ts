import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {TransactionType} from '../core/models/transaction-type.model';
import {Stock} from '../core/models/stock.model';
import {TransactionService} from '../core/services/transaction.service';
import {StockService} from '../core/services/stock.service';
import {distinctUntilChanged, startWith, switchMap} from 'rxjs/operators';
import * as moment from 'moment';
import {Logger} from '../logger';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {MAT_DATE_FORMATS, MatAutocomplete} from '@angular/material';

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
  selector: 'app-create-transaction-dialog',
  templateUrl: './create-transaction-dialog.component.html',
  styleUrls: ['./create-transaction-dialog.component.css'],
  providers: [
    {provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true }},
    {provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS}
  ]
})
export class CreateTransactionDialogComponent implements OnInit {

  transactionForm: FormGroup;

  transactionTypes: Observable<TransactionType[]>;
  stocks: Observable<Stock[]>;

  @ViewChild('autoStock') matAutocomplete: MatAutocomplete;

  constructor(
    private transactionService: TransactionService,
    private stockService: StockService
  ) { }

  ngOnInit() {
    this.buildTransactionForm();

    this.initData();
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

    this.stocks.subscribe(data => {
      if (this.matAutocomplete.options && this.matAutocomplete.options.first) {
        this.matAutocomplete.options.first.select();
      }

      if (data && data.length > 0) {
        this.transactionForm.get('stock').setValue(data[0]);
      }
    });
  }

  private buildTransactionForm() {
    const today = moment().format('YYYY-MM-DD');

    const transactionTypeSell = 1;

    this.transactionForm = new FormGroup({
      stock: new FormControl('', Validators.required),
      quantity: new FormControl('', [Validators.required, Validators.min(0)]),
      price: new FormControl('', [Validators.required, Validators.min(0)]),
      type: new FormControl(transactionTypeSell, Validators.required),
      transactedOn: new FormControl(today, Validators.required),
    });
  }

  onClickSaveTransaction() {
    this.transactionService.save(this.transactionForm.value)
      .subscribe(
        data => {
          Logger.log(CreateTransactionDialogComponent.name, data);

          AJS.flag({
            type: 'success',
            close: 'auto',
            title: 'Thành công',
            body: 'Tạo giao dịch mới thành thành công',
          });
        },
        err => {
          Logger.log(CreateTransactionDialogComponent.name, err);

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
    Logger.log(CreateTransactionDialogComponent.name, stock);

    return stock ? `${stock.code}-${stock.title}` : undefined;
  }
}
