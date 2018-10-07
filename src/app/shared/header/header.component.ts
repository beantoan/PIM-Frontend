import {Component, Input, NgModule, OnInit} from '@angular/core';
import {User} from '../../core/models/user.model';
import {UserService} from '../../core/services/user.service';
import {MatButtonModule, MatCardModule, MatDialog, MatDividerModule, MatToolbarModule} from '@angular/material';
import {CreateTransactionDialogComponent} from '../../create-transaction-dialog/create-transaction-dialog.component';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {ShowAuthedDirective} from '../show-authed.directive';
import {FlexLayoutModule} from '@angular/flex-layout';

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
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  onCreateTransactionClicked() {
    this.showDialog();
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
