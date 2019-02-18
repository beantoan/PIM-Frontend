import {Component, Inject, NgModule, OnInit} from '@angular/core';
import {CoreModule} from '../core/core.module';
import {
  MAT_DIALOG_DATA,
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatDialogRef,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatProgressBarModule,
  MatSnackBar
} from '@angular/material';
import {DatePipe} from '@angular/common';
import {TransactionType} from '../core/models/transaction-type.model';
import {Transaction} from '../core/models/transaction.model';
import {TransactionService} from '../core/services/transaction.service';
import {Logger} from '../core/services/logger';
import {MediaObserver} from '@angular/flex-layout';
import {AppEventEmitter} from '../core/services/app-event-emitter.service';

declare var AJS: any;

@Component({
  selector: 'app-delete-transaction-dialog',
  templateUrl: './delete-transaction-dialog.component.html',
  styleUrls: ['./delete-transaction-dialog.component.css']
})
export class DeleteTransactionDialogComponent implements OnInit {

  isSubmitting = false;
  errorMessage = null;

  constructor(
    private media: MediaObserver,
    private snackBar: MatSnackBar,
    private transactionService: TransactionService,
    private dialogRef: MatDialogRef<DeleteTransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private transaction: Transaction,
    private appEventEmitter: AppEventEmitter
  ) { }

  ngOnInit() {
  }

  getDialogTitle() {
    if (this.transaction) {
      const datePipe = new DatePipe('en_US');

      const dateValue = datePipe.transform(this.transaction.transactedOn, 'd/M/yy');
      const typeTitle = TransactionType.getType(this.transaction.type).title.toLowerCase();

      return `Bạn có muốn xóa giao dịch ${typeTitle} ${this.transaction.quantity} ${this.transaction.stock.code} ngày ${dateValue} không?`;
    }

    return '';
  }

  onCloseDialogClicked() {
    this.dialogRef.close(true);
  }

  onDeleteTransactionClicked() {
    this.deleteTransaction();
  }

  private deleteTransaction() {
    Logger.info(DeleteTransactionDialogComponent.name, 'deleteTransaction', this.transaction);

    this.errorMessage = null;

    if (this.transaction) {

      this.isSubmitting = true;

      this.transactionService.delete(this.transaction)
        .subscribe(
          data => {
            this.appEventEmitter.onTransactionTouched.emit(true);

            this.dialogRef.close(true);

            if (this.media.isActive('lt-md')) {
              this.snackBar.open(data.msg, null, {
                duration: 3000
              });
            } else {
              AJS.flag({
                type: 'success',
                close: 'auto',
                title: 'Thành công',
                body: data.msg,
              });
            }
          },
          err => {
            Logger.info(DeleteTransactionDialogComponent.name, 'deleteTransaction', err);

            this.appEventEmitter.onTransactionTouched.emit(true);

            this.errorMessage = err.msg || err.message;

            this.isSubmitting = false;
          },
          () => {
            this.isSubmitting = false;
          }
        );
    }
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
    MatDialogModule,
    MatProgressBarModule
  ],
  exports: [DeleteTransactionDialogComponent],
  declarations: [DeleteTransactionDialogComponent],
  entryComponents: [DeleteTransactionDialogComponent]
})
export class DeleteTransactionDialogModule {
}
