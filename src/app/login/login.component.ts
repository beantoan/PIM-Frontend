import {Component, OnInit} from '@angular/core';
import {User} from '../core/models/user.model';

@Component({
  selector: 'app-root',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user: User;

  constructor() {
  }

  ngOnInit() {
  }

}
