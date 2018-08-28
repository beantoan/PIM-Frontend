import { Component, OnInit } from '@angular/core';
import {User} from '../entities/user';

@Component({
  selector: 'app-root',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user: User;

  constructor() { }

  ngOnInit() {
  }

}
