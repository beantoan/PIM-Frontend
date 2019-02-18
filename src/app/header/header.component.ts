import {Component, Input, NgModule, OnInit} from '@angular/core';
import {User} from '../core/models/user.model';
import {UserService} from '../core/services/user.service';
import {
  MatButtonModule,
  MatCardModule,
  MatDialog,
  MatDividerModule,
  MatIconModule,
  MatListModule,
  MatProgressBarModule,
  MatSidenavModule,
  MatToolbarModule
} from '@angular/material';
import {TransactionDialogComponent} from '../transaction-dialog/transaction-dialog.component';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {ShowAuthedDirective} from '../core/services/show-authed.directive';
import {FlexLayoutModule} from '@angular/flex-layout';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['header.component.scss'],
  providers: [],
})
export class HeaderComponent implements OnInit {
  currentUser: User;
  footerTitle = environment.appName;

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

  private showTransactionDialog() {
    const dialogRef = this.createTransactionDialog.open(TransactionDialogComponent, {
      width: '600px',
      autoFocus: true
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
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
    FlexLayoutModule
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
