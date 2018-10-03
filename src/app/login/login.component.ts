import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../core/services/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Logger} from '../logger.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {
  }

  ngOnInit() {
      this.createLoginForm();
  }

  private createLoginForm() {
    this.loginForm = new FormGroup({
      username: new FormControl('admin@pim.vn', Validators.required),
      password: new FormControl('admin', Validators.required),
    });
  }

  submitForm() {
    Logger.log('submitForm');

    this.isSubmitting = true;

    const credentials = this.loginForm.value;

    this.userService
      .attemptAuth(this.authType, credentials)
      .subscribe(
        data => {
          this.userService.populate();
        },
        err => {
          Logger.error(err);
        },
        () => {
          this.isSubmitting = false;
        }
      );
  }

}
