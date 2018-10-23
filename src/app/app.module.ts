import {BrowserModule, Title} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';

import {AppComponent} from './app.component';
import {LoginModule} from './login/login.component';
import {DashboardModule} from './dashboard/dashboard.component';
import {InvestmentPeriodModule} from './investment/investment.component';
import {TransactionDialogModule} from './transaction-dialog/transaction-dialog.component';
import {FooterModule} from './footer/footer.component';
import {HeaderModule} from './header/header.component';
import {CoreModule} from './core/core.module';
import {TopupModule} from './topup/topup.component';
import {TopupDialogModule} from './topup-dialog/topup-dialog.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CoreModule,
    BrowserModule,
    AppRoutingModule,
    HeaderModule,
    FooterModule,
    LoginModule,
    DashboardModule,
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
