import {Inject, LOCALE_ID, Pipe, PipeTransform} from '@angular/core';
import {DecimalPipe} from '@angular/common';

@Pipe({
  name: 'money'
})
export class MoneyPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(value: any, args?: any): any {
    const thousand = 1000;
    const number = new DecimalPipe(this.locale);

    if (Math.abs(value) < thousand) {
      return number.transform(value);
    }

    const billion = thousand * thousand;

    if (value % billion === 0) {
      return number.transform(value / billion) + 'M';
    }

    return number.transform(Math.round(value / thousand)) + 'K';
  }

}
