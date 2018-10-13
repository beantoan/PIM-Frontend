import {Inject, LOCALE_ID, Pipe, PipeTransform} from '@angular/core';
import {DecimalPipe} from '@angular/common';

@Pipe({
  name: 'price'
})
export class PricePipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(value: any, args?: any): any {
    const fixed = (Math.round(value / 100) / 10);

    return new DecimalPipe(this.locale).transform(fixed);
  }

}
