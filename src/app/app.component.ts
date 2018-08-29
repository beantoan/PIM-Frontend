import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {environment} from '../environments/environment';
import {ActivatedRouteSnapshot, NavigationEnd, Router} from '@angular/router';
import {UserService} from './core/services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  bodyCssClass = 'aui-page-focused aui-page-size-large';

  public constructor(
    private router: Router,
    private userService: UserService,
    private titleService: Title
  ) {
    this.titleService.setTitle(environment.title);
  }

  ngOnInit(): void {
    this.userService.populate();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.titleService.setTitle(this.getTitle(this.router.routerState.snapshot.root));
      }
    });


    if (this.userService.isAuthenticated) {
      this.bodyCssClass = 'aui-layout aui-theme-default page-type-login aui-page-focused aui-page-focused-medium aui-page-size-medium ';
    }
  }

  private getTitle(snapshot: ActivatedRouteSnapshot): string {
    if (snapshot) {
      if (snapshot.firstChild) {
        return this.getTitle(snapshot.firstChild);
      }

      if (snapshot.data['title']) {
        return `${environment.title} | ${snapshot.data['title']}`;
      }
    }

    return environment.title;
  }
}
