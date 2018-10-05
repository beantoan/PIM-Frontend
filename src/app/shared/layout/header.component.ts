import {Component, Input, OnInit} from '@angular/core';
import {User} from '../../core/models/user.model';
import {UserService} from '../../core/services/user.service';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDialog} from '@angular/material';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {MomentUtcDateAdapter} from '../moment-utc-date.adapter';
import {CreateTransactionDialogComponent} from '../../create-transaction-dialog/create-transaction-dialog.component';

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
export class HeaderComponent implements OnInit {
  currentUser: User;

  @Input('title') title: string;

  constructor(
    public createTransactionDialog: MatDialog,
    private userService: UserService
  ) {
  }

  ngOnInit() {
    this.subscribeEvents();
  }

  private subscribeEvents() {
    this.userService.currentUser.subscribe(
      (userData) => {
        this.currentUser = userData;
      }
    );
  }

  showDialog() {
    const dialogRef = this.createTransactionDialog.open(CreateTransactionDialogComponent, {
      height: '400px',
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  onClickCreateTransaction() {
    this.showDialog();
  }
}
