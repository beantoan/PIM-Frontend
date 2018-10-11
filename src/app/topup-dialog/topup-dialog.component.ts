import {Component, Inject, NgModule, OnInit} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  MAT_DATE_FORMATS,
  MAT_DIALOG_DATA,
  MatButtonModule,
  MatCardModule,
  MatDatepickerModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatSnackBar
} from '@angular/material';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule} from '@angular/material-moment-adapter';
import {FlexLayoutModule, ObservableMedia} from '@angular/flex-layout';
import {Logger} from '../core/services/logger';
import {Stock} from '../core/models/stock.model';
import * as moment from 'moment';
import {Topup} from '../core/models/topup.model';
import {TopupService} from '../core/services/topup.service';
import {merge} from 'rxjs';

declare var AJS: any;

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
  selector: 'app-topup-dialog',
  templateUrl: './topup-dialog.component.html',
  styleUrls: ['./topup-dialog.component.css'],
  providers: [
    {provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true }},
    {provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS}
  ]
})
export class TopupDialogComponent implements OnInit {

  topupForm: FormGroup;

  errorMessage = null;
  isSubmitting = false;

  constructor(
    private media: ObservableMedia,
    private snackBar: MatSnackBar,
    private topupService: TopupService,
    @Inject(MAT_DIALOG_DATA) public topup: Topup
  ) { }

  ngOnInit() {
    this.buildTopupForm();
    this.subscribeEvents();
  }

  onSaveTopupClicked() {
    this.createNewTopup();
  }

  private createNewTopup() {
    Logger.info(TopupDialogComponent.name, 'createNewTopup', this.topupForm.value);

    this.errorMessage = null;
    this.isSubmitting = true;

    if (this.topupForm.valid) {
      const topupData = this.topupForm.value;

      if (this.topup) {
        topupData.id = this.topup.id;
      }

      this.topupService.create(topupData)
        .subscribe(
          data => {

            this.resetTopupForm();

            const message = this.topup && this.topup.id ? 'Sửa tiền vốn thành công' : 'Thêm tiền vốn thành thành công';

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
            Logger.info(TopupDialogComponent.name, 'createNewTopup', err);

            if (this.topup && this.topup.id) {
              this.errorMessage = 'Gặp lỗi khi sửa tiền vốn. Hãy liên hệ với admin@pim.vn để được giúp đỡ.';
            } else {
              this.errorMessage = 'Gặp lỗi khi thêm tiền vốn. Hãy liên hệ với admin@pim.vn để được giúp đỡ.';
            }

            this.isSubmitting = false;
          },
          () => {
            this.isSubmitting = false;
          }
        );
    } else {
      this.setTopupFormFieldsAsTouched();

      this.errorMessage = 'Hãy nhập đầy đủ thông tin giao dịch';

      this.isSubmitting = false;
    }
  }

  private setTopupFormFieldsAsTouched() {
    const amountInputField = this.topupForm.get('amount');
    const addedOnInputField = this.topupForm.get('addedOn');

    amountInputField.markAsTouched();
    addedOnInputField.markAsTouched();
  }

  /**
   * Create a topup form
   */
  private buildTopupForm() {
    const today = moment().format('YYYY-MM-DD');

    let amountVal: string | number = '';
    let addedOnVal: string | Date = today;
    let noteVal: string | Stock = '';

    if (this.topup) {
      amountVal = this.topup.amount;
      addedOnVal = this.topup.addedOn || addedOnVal;
      noteVal = this.topup.note;
    }

    this.topupForm = new FormGroup({
      amount: new FormControl(amountVal, [Validators.required]),
      addedOn: new FormControl(addedOnVal, [Validators.required]),
      note: new FormControl(noteVal)
    });
  }

  private resetTopupForm() {
    const amountInputField = this.topupForm.get('amount');
    const noteInputField = this.topupForm.get('note');

    amountInputField.setValue('');
    amountInputField.markAsUntouched();

    noteInputField.setValue('');
    noteInputField.markAsUntouched();
  }

  private subscribeEvents() {
    merge(
      this.topupForm.get('amount').valueChanges,
      this.topupForm.get('addedOn').valueChanges,
      this.topupForm.get('note').valueChanges,
    ).subscribe(data => {
      this.errorMessage = null;
    });
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
    MatProgressSpinnerModule,
    MatIconModule,
    MatDatepickerModule,
    MatDialogModule,
    MatMomentDateModule,
    FlexLayoutModule
  ],
  exports: [TopupDialogComponent],
  declarations: [TopupDialogComponent],
  entryComponents: [TopupDialogComponent]
})
export class TopupDialogModule {
}
