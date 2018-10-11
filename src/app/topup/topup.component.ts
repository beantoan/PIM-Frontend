import {Component, NgModule, OnInit} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  MatButtonModule,
  MatCardModule,
  MatDialog,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatProgressSpinnerModule
} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {Logger} from '../core/services/logger';
import {TopupDialogComponent} from '../topup-dialog/topup-dialog.component';

@Component({
  selector: 'app-topup',
  templateUrl: './topup.component.html',
  styleUrls: ['./topup.component.css']
})
export class TopupComponent implements OnInit {

  constructor(
    public createTopupDialog: MatDialog
  ) { }

  ngOnInit() {
    this.subscribeEvents();
  }

  onAddTopupClicked() {
    this.showTopupDialog();
  }

  private showTopupDialog() {
    const dialogRef = this.createTopupDialog.open(TopupDialogComponent, {
      width: '400px',
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      Logger.info(TopupComponent.name, 'showTopupDialog', 'dialog is closed', result);

      // TODO need to reload the data
    });
  }

  private subscribeEvents() {

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
    FlexLayoutModule
  ],
  exports: [TopupComponent],
  declarations: [TopupComponent],
})
export class TopupModule {
}
