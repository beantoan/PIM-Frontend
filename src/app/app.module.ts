import {BrowserModule, Title} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';

import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {CoreModule} from './core/core.module';
import {InvestmentPeriodComponent} from './investment-period/investment-period.component';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatOptionModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatSelectModule,
  MatSortModule,
  MatTableModule,
  MatToolbarModule
} from '@angular/material';
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import {CreateTransactionDialogComponent} from './create-transaction-dialog/create-transaction-dialog.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FooterModule} from './shared/footer/footer.component';
import {HeaderModule} from './shared/header/header.component';
import {StockComponent} from './stock/stock.component';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    InvestmentPeriodComponent,
    CreateTransactionDialogComponent,
    StockComponent
  ],
  imports: [
    HttpClientModule,
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    BrowserModule,
    CoreModule,
    AppRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatSelectModule,
    MatOptionModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatCardModule,
    MatRadioModule,
    FlexLayoutModule,
    HeaderModule,
    FooterModule
  ],
  providers: [Title],
  entryComponents: [CreateTransactionDialogComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
}
