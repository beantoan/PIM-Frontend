import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {environment} from '../environments/environment';
import {ActivatedRouteSnapshot, NavigationEnd, Router} from '@angular/router';
import {UserService} from './core/services/user.service';
import {LoginComponent} from './login/login.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  bodyCssClass = 'aui-page-focused aui-page-size-large';
  appTitle = environment.title;

  public constructor(
    private router: Router,
    private userService: UserService,
    private titleService: Title
  ) {}

  /**
   * Check whether or not a component is LoginComponent
   *
   * @param componentName
   * @return boolean
   */
  private static isLoginComponent(componentName: string): boolean {
    return componentName === LoginComponent.name;
  }

  ngOnInit(): void {
    this.userService.populate();

    this.titleService.setTitle(environment.title);

    this.subscribeRouterEvents();
  }

  /**
   * Subscribe the events of router
   */
  private subscribeRouterEvents() {
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
      this.bodyCssClass = 'aui-page-focused aui-page-focused-medium aui-page-size-medium';
      this.appTitle = environment.appName;
    } else {
      this.bodyCssClass = 'aui-page-focused aui-page-size-large';
      this.appTitle = environment.title;
    }
  }

  /**
   * Analyze the route
   *
   * @param snapshot
   * @return [isLoginPage: boolean, title: string]
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
