import {BrowserModule, Title} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';

import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {HeaderComponent} from './shared/layout/header.component';
import {FooterComponent} from './shared/layout/footer.component';
import {SharedModule} from './shared/shared.module';
import {CoreModule} from './core/core.module';
import {PageHeaderComponent} from './shared/layout/page-header.component';
import {NoAuthGuard} from './login/no-auth-guard.service';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    PageHeaderComponent,
    LoginComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    CoreModule,
    SharedModule,
    AppRoutingModule
  ],
  providers: [Title, NoAuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule {
}
