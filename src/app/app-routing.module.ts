import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';

import {LoginComponent} from './login/login.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {NoAuthGuard} from './core/services/no-auth-guard.service';
import {AuthGuard} from './core/services/auth-guard.service';
import {InvestmentComponent} from './investment/investment.component';
import {TopupComponent} from './topup/topup.component';

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
      title: 'Đăng nhập'
    }
  },
  {
    path: 'investments/:groupType',
    component: InvestmentComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Đầu tư'
    }
  },
  {
    path: 'investments/:groupType/:viewType',
    component: InvestmentComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Đầu tư'
    }
  },
  {
    path: 'topups',
    component: TopupComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Tiền vốn'
    }
  }
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
