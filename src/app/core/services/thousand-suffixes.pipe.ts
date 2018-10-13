import {Inject, LOCALE_ID, Pipe, PipeTransform} from '@angular/core';
import {DecimalPipe} from '@angular/common';

@Pipe({
  name: 'thousandSuff'
})
export class ThousandSuffixesPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(input: any, args?: any): any {

    if (Number.isNaN(input)) {
      return null;
    }

    const number = new DecimalPipe(this.locale);

    const thousand = 1000;

    if (input < thousand) {
      return number.transform(input);
    }

    const million = thousand * thousand;
    let exp = 1;
    let suffix = '';

    if (input % thousand === 0 && input < million) {
      exp = thousand;
      suffix = 'K';
    }

    if (input % million === 0) {
      exp = million;
      suffix = 'M';
    } else {
      if (input % thousand === 0) {
        exp = thousand;
        suffix = 'K';
      }
    }

    const fixed = (input / exp).toFixed(args);

    return number.transform(fixed) + suffix;
  }

}
