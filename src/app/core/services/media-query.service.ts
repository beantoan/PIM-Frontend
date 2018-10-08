import {Injectable, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {MediaChange, ObservableMedia} from '@angular/flex-layout';

@Injectable()
export class MediaQueryService implements OnDestroy {
  watcher: Subscription;
  activeMediaQuery = '';

  constructor(media: ObservableMedia) {
    this.watcher = media.subscribe((change: MediaChange) => {
      this.activeMediaQuery = change.mqAlias;
    });
  }

  ngOnDestroy() {
    this.watcher.unsubscribe();
  }

}
