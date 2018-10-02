import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {AuthenticationInterceptor} from './interceptors/authentication.interceptor';
import {ApiService} from './services/api.service';
import {AuthGuard} from './services/auth-guard.service';
import {JwtService} from './services/jwt.service';
import {UserService} from './services/user.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthenticationInterceptor, multi: true },
    ApiService,
    AuthGuard,
    JwtService,
    UserService
  ],
  declarations: []
})
export class CoreModule {
}
