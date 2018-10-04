import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {User} from '../../core/models/user.model';
import {UserService} from '../../core/services/user.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {TransactionService} from '../../core/services/transaction.service';
import {StockService} from '../../core/services/stock.service';
import {Stock} from '../../core/models/stock.model';
import {concat, Observable, of, Subject} from 'rxjs';
import {TransactionType} from '../../core/models/transaction-type.model';
import {catchError, debounceTime, distinctUntilChanged, switchMap, tap} from 'rxjs/operators';

declare var AJS: any;

@Component({
  selector: 'app-layout-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, AfterViewInit {
  currentUser: User;
  dialogId = 'add-transaction-dialog';
  isSubmitting = false;
  transactionForm: FormGroup;

  transactionTypes: Observable<TransactionType[]>;
  stocks: Observable<Stock[]>;
  searchStockLoading = false;
  searchStockTerm = new Subject<string>();

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

    this.transactionTypes = this.transactionService.getTypes();

    this.stocks = concat(
      of([]),
      this.searchStockTerm.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => this.searchStockLoading = true),
        switchMap(term => this.stockService.search(term).pipe(
          catchError(() => of([])),
          tap(() => this.searchStockLoading = false)
        ))
      ));
  }

  private subscribeEvents() {
    this.userService.currentUser.subscribe(
      (userData) => {
        this.currentUser = userData;
      }
    );
  }

  private buildTransactionForm() {
    this.transactionForm = new FormGroup({
      stock_id: new FormControl('', Validators.required),
      quantity: new FormControl('', Validators.required),
      price: new FormControl('', Validators.required),
      type: new FormControl(1, Validators.required),
      transacted_at: new FormControl('', Validators.required),
    });
  }

  ngAfterViewInit() {
    this.hideDialog();

    AJS.$('#transacted_at').datePicker({'overrideBrowserDefault': true});
  }

  showDialog() {
    AJS.dialog2(`#${this.dialogId}`).show();
  }

  hideDialog() {
    AJS.dialog2(`#${this.dialogId}`).hide();
  }

  onClickCreateTransaction() {
    this.showDialog();
  }

  onClickSaveTransaction() {

  }
}
