import {AfterViewInit, Component, Inject, NgModule, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
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
import {CoreModule} from '../core/core.module';
import {DatePipe} from '@angular/common';
import {TextMaskModule} from 'angular2-text-mask';
import {createNumberMask} from 'text-mask-addons/dist/textMaskAddons';

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

  public decimalMask = createNumberMask({
    prefix: '',
    suffix: '',
    allowDecimal: true
  });

  public integerMask = createNumberMask({
    prefix: '',
    suffix: '',
    allowDecimal: false
  });

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

    this.setTransactionFormValidators(typeVal);
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
      case TransactionType.TYPE_CASH_ADVANCE_FEE:
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

  private getTransactionFormData() {
    const data = this.transactionForm.value;

    if (data.quantity) {
      data.quantity = data.quantity.toString().replace(/,/g, '');
    }

    if (data.price) {
      data.price = data.price.toString().replace(/,/g, '');
    }

    if (data.money) {
      data.money = data.money.toString().replace(/,/g, '');
    }

    if (this.transaction) {
      data.id = this.transaction.id;
    }

    return data;
  }

  /**
   * To create new transaction
   */
  private createNewTransaction() {
    this.savedTransactionData = null;
    const transactionData = this.getTransactionFormData();

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
    const transactionData = this.getTransactionFormData();

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

  private getSelectedTransactionType() {
    return this.transactionForm.get('type').value;
  }

  /**
   * When save the transaction button is clicked.
   * Check the validity first. Then submit the data to API server.
   * Set the input fields as touched if the form is invalid.
   */
  onSaveTransactionClicked() {
    Logger.info(TransactionDialogComponent.name, 'onSaveTransactionClicked', this.getTransactionFormData());

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
    const showQuantityInputFieldTypes = [
      TransactionType.TYPE_BUY,
      TransactionType.TYPE_SELL,
      TransactionType.TYPE_STOCK_DIVIDEND,
      TransactionType.TYPE_AWARD_DIVIDEND,
    ];

    return showQuantityInputFieldTypes.indexOf(this.getSelectedTransactionType()) > -1;
  }

  displayPriceInputField() {
    const showPriceInputFieldTypes = [
      TransactionType.TYPE_BUY,
      TransactionType.TYPE_SELL
    ];

    return showPriceInputFieldTypes.indexOf(this.getSelectedTransactionType()) > -1;
  }

  displayMoneyInputField() {
    const showMoneyInputFieldTypes = [
      TransactionType.TYPE_MONEY_DIVIDEND,
      TransactionType.TYPE_CASH_ADVANCE_FEE
    ];

    return showMoneyInputFieldTypes.indexOf(this.getSelectedTransactionType()) > -1;
  }

  getDialogTitle() {
    if (this.isExistedTransaction) {
      const datePipe = new DatePipe('en_US');

      const dateValue = datePipe.transform(this.transaction.transactedOn, 'd/M/yy');
      const typeTitle = TransactionType.getType(this.transaction.type).title.toLowerCase();

      switch (this.transaction.type) {
        case TransactionType.TYPE_BUY:
        case TransactionType.TYPE_SELL:
          return `Sửa giao dịch ${typeTitle} ${this.transaction.quantity} ${this.transaction.stock.code} ngày ${dateValue}`;
        case TransactionType.TYPE_STOCK_DIVIDEND:
        case TransactionType.TYPE_AWARD_DIVIDEND:
          return `Sửa giao dịch ${this.transaction.quantity} ${typeTitle} ${this.transaction.stock.code} ngày ${dateValue}`;
        case TransactionType.TYPE_MONEY_DIVIDEND:
          return `Sửa giao dịch ${this.transaction.money} ${typeTitle} ${this.transaction.stock.code} ngày ${dateValue}`;
      }
    }

    return 'Tạo giao dịch mới';
  }
}

@NgModule({
  imports: [
    CoreModule,
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
    FlexLayoutModule,
    TextMaskModule
  ],
  exports: [TransactionDialogComponent],
  declarations: [TransactionDialogComponent],
  entryComponents: [TransactionDialogComponent]
})
export class TransactionDialogModule {
}
