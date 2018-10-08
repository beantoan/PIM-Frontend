import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {environment} from '../environments/environment';
import {ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router} from '@angular/router';
import {UserService} from './core/services/user.service';
import {LoginComponent} from './login/login.component';
import {JwtService} from './core/services/jwt.service';
import {Logger} from './core/services/logger';
import {Location} from '@angular/common';
import {RoutingStateService} from './core/services/routing-state.service';

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
    private routingState: RoutingStateService
  ) {}

  /**
   * Check whether or not a component is LoginComponent
   *
   * @param componentName
   * @returnUrl boolean
   */
  private static isLoginComponent(componentName: string): boolean {
    return componentName === LoginComponent.name;
  }

  ngOnInit(): void {
    Logger.log(AppComponent.name, 'ngOnInit');

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
    Logger.log(AppComponent.name, 'subscribeEvents');

    this.userService.isAuthenticated.subscribe(
      (authenticated) => {
        if (authenticated) {
          Logger.log(AppComponent.name, 'subscribeEvents is logged in');

          const previousUrl = this.routingState.getPreviousUrl();

          if (previousUrl.startsWith('/login')) {
            const returnUrl = this.routingState.getHistory()[0];

            this.router.navigateByUrl(returnUrl);
          }
        } else {
          Logger.error(AppComponent.name, 'subscribeEvents is not logged in');

          this.router.navigateByUrl('/login');
        }
      }
    );

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.logoutIfPossible();

        const [isLoginPage, title] = this.analyzeActiveRoute(this.router.routerState.snapshot.root);

        this.titleService.setTitle(title);

        this.switchPageLayout(isLoginPage);
      }
    });
  }

  /**
   * Switch page layout between login page and normal page
   *
   * @param isLoginPage: boolean
   */
  private switchPageLayout(isLoginPage: boolean) {
    if (isLoginPage) {
      this.appTitle = environment.appName;
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
  private analyzeActiveRoute(snapshot: ActivatedRouteSnapshot): [boolean, string] {
    let isLoginPage = false;

    if (snapshot) {
      if (snapshot.firstChild) {
        return this.analyzeActiveRoute(snapshot.firstChild);
      }

      isLoginPage = AppComponent.isLoginComponent(snapshot.routeConfig.component.name);

      if (snapshot.data['title']) {
        const title = `${environment.title} | ${snapshot.data['title']}`;

        return [isLoginPage, title];
      }
    }

    return [isLoginPage, environment.title];
  }

  /**
   * Check whether or not an user should be logged out
   */
  private logoutIfPossible() {
    Logger.log(AppComponent.name, 'logoutIfPossible');

    const jwtToken = this.jwtService.getToken();

    let currentPath = null;

    if (this.activeRoute.firstChild) {
      currentPath = this.activeRoute.firstChild.snapshot.routeConfig.path;
    }

    if (!jwtToken && currentPath !== 'login') {
      Logger.log(AppComponent.name, 'logout and then redirect to login page');

      this.userService.logout();
    }
  }
}
