import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {environment} from '../environments/environment';
import {ActivatedRouteSnapshot, NavigationEnd, Router} from '@angular/router';
import {UserService} from './core/services/user.service';
import {LoginComponent} from './login/login.component';
import {JwtService} from './core/services/jwt.service';
import {Logger} from './logger';

@Component({
  selector: 'app-root',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.css'
  ]
})
export class AppComponent implements OnInit {
  bodyCssClass = 'aui-page-focused aui-page-size-large';
  appTitle = environment.title;

  public constructor(
    private router: Router,
    private userService: UserService,
    private jwtService: JwtService,
    private titleService: Title
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
    this.subscribeEvents();

    this.titleService.setTitle(environment.title);

    this.userService.populate();
  }

  /**
   * Subscribe the events of router

   * TODO redirect to right page
   */
  private subscribeEvents() {
    this.userService.isAuthenticated.subscribe(
      (authenticated) => {
        if (authenticated) {
          Logger.log(AppComponent.name, 'subscribeEvents is logged in');
          this.router.navigateByUrl('/');
        } else {
          Logger.warn(AppComponent.name, 'subscribeEvents is not logged in');
          this.router.navigateByUrl('/login');
        }
      }
    );

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
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
      this.bodyCssClass = 'aui-page-focused aui-page-size-small';
      this.appTitle = environment.appName;
    } else {
      this.bodyCssClass = '';
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
}
