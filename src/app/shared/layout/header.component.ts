import {Component, Input, OnInit} from '@angular/core';
import {User} from '../../core/models/user.model';
import {UserService} from '../../core/services/user.service';
import {MatDialog} from '@angular/material';
import {CreateTransactionDialogComponent} from '../../create-transaction-dialog/create-transaction-dialog.component';

@Component({
  selector: 'app-layout-header',
  templateUrl: './header.component.html',
  providers: [
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
