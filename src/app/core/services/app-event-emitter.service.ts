import {EventEmitter, Injectable} from '@angular/core';

@Injectable()
export class AppEventEmitter {
  public onTransactionTouched = new EventEmitter();
  public onProgressBarLoading = new EventEmitter();
}
