import {Component, Input, NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatDividerModule} from '@angular/material';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  @Input('title') title: string;

  footerTitle = environment.appName;
}


@NgModule({
  imports: [
    FlexLayoutModule,
    MatDividerModule
  ],
  exports: [FooterComponent],
  declarations: [FooterComponent],
})
export class FooterModule {
}
