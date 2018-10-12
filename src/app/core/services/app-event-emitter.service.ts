import {EventEmitter, Injectable} from '@angular/core';

@Injectable()
export class AppEventEmitter {
  public onTransactionDialogClosed = new EventEmitter();
  public onProgressBarLoading = new EventEmitter();
}
