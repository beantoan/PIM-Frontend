import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';

import {LoginComponent} from './login/login.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {NoAuthGuard} from './core/services/no-auth-guard.service';
import {AuthGuard} from './core/services/auth-guard.service';
import {InvestmentPeriodComponent} from './investment-period/investment-period.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Dashboard'
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [NoAuthGuard],
    data: {
      title: 'Login'
    }
  },
  {
    path: 'investmentPeriod',
    component: InvestmentPeriodComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Phiên đầu tư'
    }
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
  declarations: []
})

export class AppRoutingModule {
}
