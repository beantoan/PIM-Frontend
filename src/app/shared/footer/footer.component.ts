import {Component, Input, NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatDividerModule} from '@angular/material';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  @Input('title') title: string;
}


@NgModule({
  imports: [
    FlexLayoutModule,
    MatDividerModule
  ],
  exports: [
    FooterComponent
  ],
  declarations: [FooterComponent],
})
export class FooterModule {
}
