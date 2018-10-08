import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../core/services/user.service';
import {Router} from '@angular/router';
import {Logger} from '../core/services/logger';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-root',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  authType = 'login';
  isSubmitting = false;
  loginForm: FormGroup;
  errorMessage = null;

  constructor(
    private router: Router,
    private userService: UserService
  ) {
  }

  ngOnInit() {
      this.buildLoginForm();
  }

  private buildLoginForm() {
    this.loginForm = new FormGroup({
      username: new FormControl('', [
        Validators.required, Validators.email
      ]),
      password: new FormControl('', Validators.required),
    });
  }

  submitForm() {
    Logger.log(LoginComponent.name, 'submitForm');

    this.isSubmitting = true;
    this.errorMessage = null;

    if (this.loginForm.valid) {
      this.userService
        .attemptAuth(this.authType, this.loginForm.value)
        .subscribe(
          data => {
            this.userService.populate();
          },
          err => {
            Logger.error(LoginComponent.name, err);
            this.errorMessage = 'Email và mật khẩu đăng nhập không đúng';
            this.isSubmitting = false;
          },
          () => {
            this.isSubmitting = false;
          }
        );
    } else {
      this.isSubmitting = false;
      this.errorMessage = 'Hãy nhập email và mật khẩu đăng nhập';
    }
  }

}
