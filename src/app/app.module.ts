import {BrowserModule, Title} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';

import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {SharedModule} from './shared/shared.module';
import {CoreModule} from './core/core.module';
import {InvestmentPeriodComponent} from './investment-period/investment-period.component';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatDatepickerModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatOptionModule,
  MatSelectModule,
  MatToolbarModule
} from '@angular/material';
import {MatMomentDateModule} from '@angular/material-moment-adapter';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    InvestmentPeriodComponent
  ],
  imports: [
    BrowserModule,
    CoreModule,
    SharedModule,
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
    MatMenuModule
  ],
  providers: [Title],
  bootstrap: [AppComponent]
})
export class AppModule {
}
