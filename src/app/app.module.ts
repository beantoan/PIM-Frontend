import {BrowserModule, Title} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';

import {AppComponent} from './app.component';
import {LoginModule} from './login/login.component';
import {DashboardModule} from './dashboard/dashboard.component';
import {InvestmentPeriodModule} from './investment-period/investment-period.component';
import {TransactionDialogModule} from './transaction-dialog/transaction-dialog.component';
import {FooterModule} from './shared/footer/footer.component';
import {HeaderModule} from './shared/header/header.component';
import {StockModule} from './stock/stock.component';
import {CoreModule} from './core/core.module';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {TopupModule} from './topup/topup.component';
import {TopupDialogModule} from './topup-dialog/topup-dialog.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CoreModule,
    CommonModule,
    BrowserModule,
    RouterModule,
    AppRoutingModule,
    HeaderModule,
    FooterModule,
    LoginModule,
    DashboardModule,
    StockModule,
    InvestmentPeriodModule,
    TopupModule,
    TransactionDialogModule,
    TopupDialogModule
  ],
  providers: [Title],
  bootstrap: [AppComponent]
})
export class AppModule {
}
