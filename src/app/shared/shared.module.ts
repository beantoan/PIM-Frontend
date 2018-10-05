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
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatMomentDateModule} from '@angular/material-moment-adapter';

@NgModule({
  imports: [
    HttpClientModule,
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    BrowserAnimationsModule,
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
  declarations: [
    ShowAuthedDirective,
    HeaderComponent,
    FooterComponent,
    PageHeaderComponent
  ],
  exports: [
    HttpClientModule,
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ShowAuthedDirective,
    HeaderComponent,
    FooterComponent,
    PageHeaderComponent
  ]
})
export class SharedModule {}
