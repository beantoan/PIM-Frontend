import {Component, Input, NgModule, OnInit} from '@angular/core';
import {User} from '../../core/models/user.model';
import {UserService} from '../../core/services/user.service';
import {MatButtonModule, MatCardModule, MatDialog, MatDividerModule, MatToolbarModule} from '@angular/material';
import {TransactionDialogComponent} from '../../transaction-dialog/transaction-dialog.component';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {ShowAuthedDirective} from '../../core/services/show-authed.directive';
import {FlexLayoutModule} from '@angular/flex-layout';
import {Logger} from '../../core/services/logger';
import {AppEventEmitter} from '../../core/services/app-event-emitter.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['header.component.scss'],
  providers: [],
})
export class HeaderComponent implements OnInit {
  currentUser: User;

  @Input('title') title: string;

  constructor(
    public createTransactionDialog: MatDialog,
    private userService: UserService,
    private appEventEmitter: AppEventEmitter
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

  showTransactionDialog() {
    const dialogRef = this.createTransactionDialog.open(TransactionDialogComponent, {
      height: '400px',
      width: '600px',
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      Logger.info(HeaderComponent.name, 'showTransactionDialog', 'dialog is closed', result);

      this.appEventEmitter.onTransactionDialogClosed.emit(result);
    });
  }

  onCreateTransactionClicked() {
    this.showTransactionDialog();
  }

  onLogoutClicked() {
    this.userService.logout();
  }
}

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    FlexLayoutModule,
    MatDividerModule
  ],
  exports: [
    ShowAuthedDirective,
    HeaderComponent
  ],
  declarations: [
    ShowAuthedDirective,
    HeaderComponent
  ],
})
export class HeaderModule {}
