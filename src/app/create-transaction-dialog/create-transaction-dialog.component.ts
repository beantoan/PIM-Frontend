import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {merge, Observable, of} from 'rxjs';
import {TransactionType} from '../core/models/transaction-type.model';
import {Stock} from '../core/models/stock.model';
import {TransactionService} from '../core/services/transaction.service';
import {StockService} from '../core/services/stock.service';
import {distinctUntilChanged, startWith, switchMap} from 'rxjs/operators';
import * as moment from 'moment';
import {Logger} from '../core/services/logger';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {MAT_DATE_FORMATS, MatAutocomplete, MatSnackBar} from '@angular/material';
import {ObservableMedia} from '@angular/flex-layout';

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

  errorMessage = null;
  isSubmitting = false;

  @ViewChild('autoStock') matAutocomplete: MatAutocomplete;

  constructor(
    private transactionService: TransactionService,
    private stockService: StockService,
    private media: ObservableMedia,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.buildTransactionForm();

    this.initData();
    this.subscribeEvents();
  }

  /**
   * Initial the datasources
   */
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

  /**
   * Subscribe the events
   */
  private subscribeEvents() {
    this.stocks.subscribe(data => {
      if (this.matAutocomplete.options && this.matAutocomplete.options.first) {
        this.matAutocomplete.options.first.select();
      }

      if (data && data.length > 0) {
        this.transactionForm.get('stock').setValue(data[0]);
      }
    });

    merge(
      this.transactionForm.get('stock').valueChanges,
      this.transactionForm.get('quantity').valueChanges,
      this.transactionForm.get('money').valueChanges,
      this.transactionForm.get('type').valueChanges,
      this.transactionForm.get('transactedOn').valueChanges,
    ).subscribe(data => {
      this.errorMessage = null;
    });
  }

  /**
   * Create a transaction form
   */
  private buildTransactionForm() {
    const today = moment().format('YYYY-MM-DD');

    this.transactionForm = new FormGroup({
      stock: new FormControl(''),
      quantity: new FormControl(''),
      price: new FormControl(''),
      money: new FormControl(''),
      type: new FormControl(TransactionType.TYPE_BUY),
      transactedOn: new FormControl(today),
    });

    this.setTransactionFormValidators(TransactionType.TYPE_BUY);
  }

  /**
   * Reset the transaction form after submitting the values
   */
  private resetTransactionForm() {
    const stockInputField = this.transactionForm.get('stock');
    const quantityInputField = this.transactionForm.get('quantity');
    const priceInputField = this.transactionForm.get('price');
    const moneyInputField = this.transactionForm.get('money');

    stockInputField.setValue('');
    stockInputField.markAsUntouched();

    quantityInputField.setValue('');
    quantityInputField.markAsUntouched();

    priceInputField.setValue('');
    priceInputField.markAsUntouched();

    moneyInputField.setValue('');
    moneyInputField.markAsUntouched();

    this.setTransactionFormValidators(this.transactionForm.get('type').value);
  }

  /**
   * Set the validators for transaction form basing on the transactionType
   *
   * @param transactionType
   */
  private setTransactionFormValidators(transactionType) {
    const stockInputField = this.transactionForm.get('stock');
    const typeInputField = this.transactionForm.get('type');
    const transactedOnInputField = this.transactionForm.get('transactedOn');
    const moneyInputField = this.transactionForm.get('money');
    const quantityInputField = this.transactionForm.get('quantity');
    const priceInputField = this.transactionForm.get('price');

    stockInputField.setValidators(Validators.required);
    typeInputField.setValidators(Validators.required);
    transactedOnInputField.setValidators(Validators.required);

    moneyInputField.clearValidators();
    quantityInputField.clearValidators();
    priceInputField.clearValidators();

    switch (transactionType) {
      case TransactionType.TYPE_BUY:
      case TransactionType.TYPE_SELL:
        quantityInputField.setValidators([Validators.required, Validators.min(1)]);
        priceInputField.setValidators([Validators.required, Validators.min(1)]);
        break;
      case TransactionType.TYPE_MONEY_DIVIDEND:
        moneyInputField.setValidators([Validators.required, Validators.min(1)]);
        break;
      case TransactionType.TYPE_AWARD_DIVIDEND:
      case TransactionType.TYPE_STOCK_DIVIDEND:
        quantityInputField.setValidators([Validators.required, Validators.min(1)]);
        break;
    }

    moneyInputField.updateValueAndValidity();
    quantityInputField.updateValueAndValidity();
    priceInputField.updateValueAndValidity();
  }

  /**
   * Mark the fields of transaction form as touched when the form is invalid.
   * This will make the input fields marked as red
   */
  private setTransactionFormFieldsAsTouched() {
    const stockInputField = this.transactionForm.get('stock');
    const typeInputField = this.transactionForm.get('type');
    const transactedOnInputField = this.transactionForm.get('transactedOn');
    const moneyInputField = this.transactionForm.get('money');
    const quantityInputField = this.transactionForm.get('quantity');
    const priceInputField = this.transactionForm.get('price');

    stockInputField.markAsTouched();
    typeInputField.markAsTouched();
    transactedOnInputField.markAsTouched();
    moneyInputField.markAsTouched();
    quantityInputField.markAsTouched();
    priceInputField.markAsTouched();
  }

  /**
   * When save the transaction button is clicked.
   * Check the validity first. Then submit the data to API server.
   * Set the input fields as touched if the form is invalid.
   */
  onSaveTransactionClicked() {
    this.errorMessage = null;

    this.isSubmitting = true;

    if (this.transactionForm.valid) {
      this.transactionService.save(this.transactionForm.value)
        .subscribe(
          data => {
            Logger.log(CreateTransactionDialogComponent.name, data);

            this.resetTransactionForm();

            const message = 'Tạo giao dịch mới thành thành công';

            if (this.media.isActive('xs')) {
              this.snackBar.open(message, null, {
                duration: 3000
              });
            } else {
              AJS.flag({
                type: 'success',
                close: 'auto',
                title: 'Thành công',
                body: message,
              });
            }
          },
          err => {
            Logger.log(CreateTransactionDialogComponent.name, err);

            this.errorMessage = 'Gặp lỗi khi tạo giao dịch. Hãy liên hệ với admin@pim.vn để được giúp đỡ.';
            this.isSubmitting = false;
          },
          () => {
            this.isSubmitting = false;
          }
        );
    } else {
      this.setTransactionFormFieldsAsTouched();

      this.errorMessage = 'Hãy nhập đầy đủ thông tin giao dịch';

      this.isSubmitting = false;
    }
  }

  /**
   * Change the validators of the input fields when the transaction type is changed
   * @param event
   */
  onTransactionTypeChanged(event) {
    this.setTransactionFormValidators(event.source.value);
  }

  displayStockOption(stock?: Stock): string | undefined {
    Logger.log(CreateTransactionDialogComponent.name, stock);

    return stock ? `${stock.code}-${stock.title}` : undefined;
  }

  displayQuantityInputField() {
    return this.transactionForm.get('type').value !== TransactionType.TYPE_MONEY_DIVIDEND;
  }

  displayPriceInputField() {
    const selectedType = this.transactionForm.get('type').value;
    return selectedType === TransactionType.TYPE_BUY || selectedType === TransactionType.TYPE_SELL;
  }

  displayMoneyInputField() {
    return this.transactionForm.get('type').value === TransactionType.TYPE_MONEY_DIVIDEND;
  }
}
