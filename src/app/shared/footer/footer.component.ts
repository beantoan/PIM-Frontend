import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
}


@NgModule({
  exports: [FooterComponent],
  declarations: [FooterComponent],
})
export class FooterModule {}
