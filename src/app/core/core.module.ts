import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {AuthenticationInterceptor} from './interceptors/authentication.interceptor';
import {ApiService} from './services/api.service';
import {AuthGuard} from './services/auth-guard.service';
import {JwtService} from './services/jwt.service';
import {UserService} from './services/user.service';
import {NoAuthGuard} from './services/no-auth-guard.service';
import {TransactionService} from './services/transaction.service';
import {RouterModule} from '@angular/router';
import {StockService} from './services/stock.service';
import {InvestmentPeriodService} from './services/investment-period.service';
import {RoutingStateService} from './services/routing-state.service';
import {MediaQueryService} from './services/media-query.service';
import {AppEventEmitter} from './services/app-event-emitter.service';
import {TopupService} from './services/topup.service';
import {PricePipe} from './services/price.pipe';
import {MoneyPipe} from './services/money.pipe';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FeePipe} from './services/fee.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthenticationInterceptor, multi: true },
    ApiService,
    AuthGuard,
    NoAuthGuard,
    JwtService,
    UserService,
    TransactionService,
    StockService,
    TopupService,
    InvestmentPeriodService,
    RoutingStateService,
    MediaQueryService,
    AppEventEmitter
  ],
  exports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PricePipe,
    MoneyPipe,
    FeePipe
  ],
  declarations: [
    PricePipe,
    MoneyPipe,
    FeePipe
  ]
})
export class CoreModule {
}
