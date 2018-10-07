import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';

@Injectable()
export class RoutingStateService {
  private history = [];

  constructor(
    private router: Router
  ) {}

  public subscribeHistories(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(({urlAfterRedirects}: NavigationEnd) => {
        this.history = [this.getPreviousUrl(), urlAfterRedirects];
      });
  }

  public getHistory(): string[] {
    return this.history;
  }

  public getPreviousUrl(): string {
    return this.history[this.history.length - 1] || '/';
  }
}
