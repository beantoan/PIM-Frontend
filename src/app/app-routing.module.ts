import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';

import {LoginComponent} from './login/login.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {NoAuthGuard} from './login/no-auth-guard.service';

const routes: Routes = [
  {path: '', component: DashboardComponent, data: {title: 'Dashboard'}},
  {path: 'login', component: LoginComponent, canActivate: [NoAuthGuard], data: {title: 'Login'}}
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
