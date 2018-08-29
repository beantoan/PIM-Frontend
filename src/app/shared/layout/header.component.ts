import {Component, Input, OnInit} from '@angular/core';
import {User} from '../../core/models/user.model';
import {UserService} from '../../core/services/user.service';


@Component({
  selector: 'app-layout-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  currentUser: User;

  @Input('title') title: string;

  constructor(
    private userService: UserService
  ) {
  }

  ngOnInit() {
    this.userService.currentUser.subscribe(
      (userData) => {
        this.currentUser = userData;
      }
    );
  }
}
