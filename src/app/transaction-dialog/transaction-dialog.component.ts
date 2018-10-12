import {AfterViewInit, Component, Inject, NgModule, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {merge, Observable, of} from 'rxjs';
import {TransactionType} from '../core/models/transaction-type.model';
import {Stock} from '../core/models/stock.model';
import {TransactionService} from '../core/services/transaction.service';
import {StockService} from '../core/services/stock.service';
import {distinctUntilChanged, startWith, switchMap} from 'rxjs/operators';
import * as moment from 'moment';
import {Logger} from '../core/services/logger';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule} from '@angular/material-moment-adapter';
import {
  MAT_DATE_FORMATS,
  MAT_DIALOG_DATA,
  MatAutocomplete,
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDialogRef,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatProgressBarModule,
  MatSelectModule,
  MatSnackBar
} from '@angular/material';
import {FlexLayoutModule, ObservableMedia} from '@angular/flex-layout';
import {Transaction} from '../core/models/transaction.model';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';

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
  templateUrl: './transaction-dialog.component.html',
  styleUrls: ['./transaction-dialog.component.css'],
  providers: [
    {provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true }},
    {provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS}
  ]
})
export class TransactionDialogComponent implements OnInit, AfterViewInit {

  transactionForm: FormGroup;

  transactionTypes: Observable<TransactionType[]>;
  stocks: Observable<Stock[]>;

  errorMessage = null;
  isSubmitting = false;
  isExistedTransaction = false;
  isShowTransactedOnHint = false;

  private savedTransactionData: {} = null;

  @ViewChild('autoStock') matAutocomplete: MatAutocomplete;

  constructor(
    private transactionService: TransactionService,
    private stockService: StockService,
    private media: ObservableMedia,
    private dialogRef: MatDialogRef<TransactionDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public transaction: Transaction
  ) { }

  ngOnInit() {
    this.buildTransactionForm();

    this.initData();
  }

  ngAfterViewInit() {
    this.subscribeEvents();
  }

  /**
   * Initial the datasources
   */
  private initData() {
    if (this.transaction) {
      if (this.transaction.id) {
        this.isExistedTransaction = true;
      }

      this.setIsShowTransactedOnHint(this.transaction.type);
    }

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
      if (this.matAutocomplete && this.matAutocomplete.options && this.matAutocomplete.options.first) {
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

    let stockVal: string | Stock = '';
    let quantityVal: string | number = '';
    let priceVal: string | number = '';
    let moneyVal: string | number = '';
    let typeVal = TransactionType.TYPE_BUY;
    let transactedOnVal: string | Date = today;

    if (this.transaction) {
      stockVal = this.transaction.stock;
      quantityVal = this.transaction.quantity;
      priceVal = this.transaction.price;
      moneyVal = this.transaction.money;
      typeVal = this.transaction.type || typeVal;
      transactedOnVal = this.transaction.transactedOn || transactedOnVal;
    }

    this.transactionForm = new FormGroup({
      stock: new FormControl(stockVal),
      quantity: new FormControl(quantityVal),
      price: new FormControl(priceVal),
      money: new FormControl(moneyVal),
      type: new FormControl(typeVal),
      transactedOn: new FormControl(transactedOnVal),
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
   * To create new transaction
   */
  private createNewTransaction() {
    this.savedTransactionData = null;
    const transactionData = this.transactionForm.value;

    Logger.info(TransactionDialogComponent.name, 'createNewTransaction', transactionData);

    this.transactionService.create(transactionData)
      .subscribe(
        data => {
          this.savedTransactionData = transactionData;

          this.resetTransactionForm();

          const message = 'Tạo giao dịch mới thành thành công';

          if (this.media.isActive('lt-md')) {
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
          Logger.info(TransactionDialogComponent.name, 'createNewTransaction', err);

          this.errorMessage = 'Gặp lỗi khi tạo giao dịch. Hãy liên hệ với admin@pim.vn để được giúp đỡ.';
          this.isSubmitting = false;
        },
        () => {
          this.isSubmitting = false;
        }
      );
  }

  /**
   * To update the existed transaction
   */
  private saveExistedTransaction() {
    const transactionData = this.transactionForm.value;
    transactionData.id = this.transaction.id;

    Logger.info(TransactionDialogComponent.name, 'saveExistedTransaction', transactionData);

    this.isSubmitting = true;

    this.savedTransactionData = null;

    this.transactionService.update(transactionData)
      .subscribe(
        data => {
          this.savedTransactionData = transactionData;

          const message = 'Chỉnh sửa giao dịch thành thành công';

          if (this.media.isActive('lt-md')) {
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
          Logger.info(TransactionDialogComponent.name, 'saveExistedTransaction', err);

          this.errorMessage = 'Gặp lỗi khi chỉnh sửa giao dịch. Hãy liên hệ với admin@pim.vn để được giúp đỡ.';
          this.isSubmitting = false;
        },
        () => {
          this.isSubmitting = false;
        }
      );
  }

  private setIsShowTransactedOnHint(transactionType: number) {
    const dividendTransactionTypes = [
      TransactionType.TYPE_MONEY_DIVIDEND,
      TransactionType.TYPE_STOCK_DIVIDEND,
      TransactionType.TYPE_AWARD_DIVIDEND
    ];

    this.isShowTransactedOnHint = dividendTransactionTypes.indexOf(transactionType) > -1;
  }

  /**
   * When save the transaction button is clicked.
   * Check the validity first. Then submit the data to API server.
   * Set the input fields as touched if the form is invalid.
   */
  onSaveTransactionClicked() {
    Logger.info(TransactionDialogComponent.name, 'onSaveTransactionClicked', this.isExistedTransaction);

    this.errorMessage = null;

    this.isSubmitting = true;

    if (this.transactionForm.valid) {
      if (this.isExistedTransaction) {
        this.saveExistedTransaction();
      } else {
        this.createNewTransaction();
      }
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

    this.setIsShowTransactedOnHint(event.source.value);
  }

  onCloseDialogClicked() {
    Logger.info(TransactionDialogComponent.name, 'onCloseDialogClicked', this.savedTransactionData);

    this.dialogRef.close(this.savedTransactionData);
  }

  displayStockOption(stock?: Stock): string | undefined {
    Logger.info(TransactionDialogComponent.name, 'displayStockOption', stock);

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

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatDatepickerModule,
    MatDialogModule,
    MatMomentDateModule,
    MatProgressBarModule,
    FlexLayoutModule
  ],
  exports: [TransactionDialogComponent],
  declarations: [TransactionDialogComponent],
  entryComponents: [TransactionDialogComponent]
})
export class TransactionDialogModule {
}
