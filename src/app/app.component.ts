import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {environment} from '../environments/environment';
import {ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router} from '@angular/router';
import {UserService} from './core/services/user.service';
import {JwtService} from './core/services/jwt.service';
import {Logger} from './core/services/logger';
import {Location} from '@angular/common';
import {RoutingStateService} from './core/services/routing-state.service';
import {ObservableMedia} from '@angular/flex-layout';

@Component({
  selector: 'app-root',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.css'
  ]
})
export class AppComponent implements OnInit {
  appTitle = environment.title;

  public constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private userService: UserService,
    private jwtService: JwtService,
    private titleService: Title,
    private location: Location,
    private routingState: RoutingStateService,
    private media: ObservableMedia
  ) {}

  ngOnInit(): void {
    Logger.info(AppComponent.name, 'ngOnInit');

    this.routingState.subscribeHistories();

    this.subscribeEvents();

    this.titleService.setTitle(environment.title);

    this.logoutIfPossible();

    this.userService.populate();
  }

  /**
   * Subscribe the events of router
   */
  private subscribeEvents() {
    Logger.info(AppComponent.name, 'subscribeEvents');

    this.userService.isAuthenticated.subscribe(
      (authenticated) => {
        if (authenticated) {
          Logger.info(AppComponent.name, 'subscribeEvents', 'User logged in');

          const previousUrl = this.routingState.getPreviousUrl();

          if (previousUrl.startsWith('/login')) {
            const returnUrl = this.routingState.getHistory()[0];

            this.router.navigateByUrl(returnUrl);
          }
        } else {
          Logger.error(AppComponent.name, 'subscribeEvents', 'User was not logged in');

          this.router.navigateByUrl('/login');
        }
      }
    );

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        Logger.info(AppComponent.name, 'subscribeEvents', event);

        this.logoutIfPossible();

        const title = this.analyzeActiveRoute(this.router.routerState.snapshot.root);

        this.titleService.setTitle(title);

        const isLoginPage = this.isLoginPage(event.urlAfterRedirects);

        this.switchPageLayout(isLoginPage);
      }
    });
  }

  private isLoginPage(pageUrl: string): boolean {
    return pageUrl.startsWith('/login');
  }

  /**
   * Switch page layout between login page and normal page
   *
   * @param isLoginPage: boolean
   */
  private switchPageLayout(isLoginPage: boolean) {
    if (isLoginPage) {
      if (this.media.isActive('lt-md')) {
        this.appTitle = environment.title;
      } else {
        this.appTitle = environment.appName;
      }
    } else {
      this.appTitle = environment.title;
    }
  }

  /**
   * Analyze the route
   *
   * @param snapshot
   * @returnUrl [isLoginPage: boolean, title: string]
   */
  private analyzeActiveRoute(snapshot: ActivatedRouteSnapshot): string {
    if (snapshot) {
      if (snapshot.firstChild) {
        return this.analyzeActiveRoute(snapshot.firstChild);
      }

      if (snapshot.data['title']) {
        return `${environment.title} | ${snapshot.data['title']}`;
      }
    }

    return environment.title;
  }

  /**
   * Check whether or not an user should be logged out
   */
  private logoutIfPossible() {
    Logger.info(AppComponent.name, 'logoutIfPossible');

    const jwtToken = this.jwtService.getToken();

    let currentPath = null;

    if (this.activeRoute.firstChild) {
      currentPath = this.activeRoute.firstChild.snapshot.routeConfig.path;
    }

    if (!jwtToken && currentPath !== 'login') {
      Logger.info(AppComponent.name, 'logoutIfPossible', 'logout and then redirect to login page');

      this.userService.logout();
    }
  }
}
