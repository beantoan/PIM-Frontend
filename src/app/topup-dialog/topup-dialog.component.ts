import {Component, Inject, NgModule, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {
  MAT_DATE_FORMATS,
  MAT_DIALOG_DATA,
  MatButtonModule,
  MatCardModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDialogRef,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatProgressBarModule,
  MatSnackBar
} from '@angular/material';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule} from '@angular/material-moment-adapter';
import {FlexLayoutModule, MediaObserver} from '@angular/flex-layout';
import {Logger} from '../core/services/logger';
import {Stock} from '../core/models/stock.model';
import * as moment from 'moment';
import {Topup} from '../core/models/topup.model';
import {TopupService} from '../core/services/topup.service';
import {merge} from 'rxjs';
import {CoreModule} from '../core/core.module';
import {createNumberMask} from 'text-mask-addons/dist/textMaskAddons';
import {TextMaskModule} from 'angular2-text-mask';

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

  private savedTopupData: {} = null;

  public integerMask = createNumberMask({
    prefix: '',
    suffix: '',
    allowDecimal: false,
    allowNegative: true
  });

  constructor(
    private media: MediaObserver,
    private snackBar: MatSnackBar,
    private topupService: TopupService,
    @Inject(MAT_DIALOG_DATA) public topup: Topup,
    private dialogRef: MatDialogRef<TopupDialogComponent>,
  ) { }

  ngOnInit() {
    this.buildTopupForm();
    this.subscribeEvents();
  }

  private getTopupFormData() {
    const data = this.topupForm.value;

    data.amount = data.amount.toString().replace(/,/g, '');

    if (this.topup) {
      data.id = this.topup.id;
    }

    return data;
  }

  private createNewTopup() {
    Logger.info(TopupDialogComponent.name, 'createNewTopup', this.topupForm.value);

    this.errorMessage = null;
    this.isSubmitting = true;

    this.savedTopupData = null;

    if (this.topupForm.valid) {
      const topupData = this.getTopupFormData();

      this.topupService.create(topupData)
        .subscribe(
          data => {

            this.savedTopupData = topupData;

            this.resetTopupForm();

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
            Logger.info(TopupDialogComponent.name, 'createNewTopup', err);

            this.errorMessage = err.msg || err.message;

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

  onSaveTopupClicked() {
    this.createNewTopup();
  }

  onCloseDialogClicked() {
    Logger.info(TopupDialogComponent.name, 'onCloseDialogClicked', this.savedTopupData);

    this.dialogRef.close(this.savedTopupData);
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
    MatDatepickerModule,
    MatDialogModule,
    MatMomentDateModule,
    MatProgressBarModule,
    FlexLayoutModule,
    TextMaskModule
  ],
  exports: [TopupDialogComponent],
  declarations: [TopupDialogComponent],
  entryComponents: [TopupDialogComponent]
})
export class TopupDialogModule {
}
