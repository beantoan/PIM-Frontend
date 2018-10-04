import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';

import {ShowAuthedDirective} from './show-authed.directive';
import {HeaderComponent} from './layout/header.component';
import {FooterComponent} from './layout/footer.component';
import {PageHeaderComponent} from './layout/page-header.component';
import {NgSelectModule} from '@ng-select/ng-select';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    HttpClientModule,
    RouterModule
  ],
  declarations: [
    ShowAuthedDirective,
    HeaderComponent,
    FooterComponent,
    PageHeaderComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    ShowAuthedDirective,
    HeaderComponent,
    FooterComponent,
    PageHeaderComponent
  ]
})
export class SharedModule {}
