import {Injectable, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {MediaChange, MediaObserver} from '@angular/flex-layout';

@Injectable()
export class MediaQueryService implements OnDestroy {
  watcher: Subscription;
  activeMediaQuery = '';

  constructor(media: MediaObserver) {
    this.watcher = media.media$.subscribe((change: MediaChange) => {
      this.activeMediaQuery = change.mqAlias;
    });
  }

  ngOnDestroy() {
    this.watcher.unsubscribe();
  }

}
