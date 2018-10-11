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
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatTableModule
} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {Logger} from '../core/services/logger';
import {TopupDialogComponent} from '../topup-dialog/topup-dialog.component';
import {TopupService} from '../core/services/topup.service';
import {PageResponse} from '../core/models/page-response.model';
import {Topup} from '../core/models/topup.model';

@Component({
  selector: 'app-topup',
  templateUrl: './topup.component.html',
  styleUrls: ['./topup.component.css']
})
export class TopupComponent implements OnInit {

  topupPageResponse: PageResponse<Topup> = new PageResponse<Topup>();

  topupPageSize = 50;
  isLoadingTopups = false;

  constructor(
    public createTopupDialog: MatDialog,
    private topupService: TopupService
  ) { }

  ngOnInit() {
    this.loadTopups();
  }

  private loadTopups() {
    this.isLoadingTopups = true;

    this.topupService.index(0, this.topupPageSize)
      .subscribe(data => {
        this.topupPageResponse = data;
        this.isLoadingTopups = false;
      }, err => {
        this.isLoadingTopups = false;
      });
  }

  private showTopupDialog(topup: Topup) {
    const dialogRef = this.createTopupDialog.open(TopupDialogComponent, {
      width: '400px',
      autoFocus: true,
      data: topup
    });

    dialogRef.afterClosed().subscribe(result => {
      Logger.info(TopupComponent.name, 'showTopupDialog', 'dialog is closed', result);

      if (result) {
        this.loadTopups();
      }
    });
  }

  onAddTopupClicked() {
    this.showTopupDialog(null);
  }

  getTotalAmount() {
    if (this.topupPageResponse.content) {
      return this.topupPageResponse.content
        .map(item => item.amount)
        .reduce((acc, value) => acc + value, 0);
    }

    return 0;
  }

  onEditTopupClicked(topup: Topup) {
    this.showTopupDialog(topup);
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
    MatTableModule,
    MatPaginatorModule,
    FlexLayoutModule
  ],
  exports: [TopupComponent],
  declarations: [TopupComponent],
})
export class TopupModule {
}
