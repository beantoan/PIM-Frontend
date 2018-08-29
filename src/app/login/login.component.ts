import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../core/services/user.service';
import {ActivatedRoute, Router} from '@angular/router';

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
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }


  submitForm() {
    this.isSubmitting = true;

    const credentials = this.loginForm.value;

    this.userService
      .attemptAuth(this.authType, credentials)
      .subscribe(
        data => this.router.navigateByUrl('/'),
        err => {
          this.isSubmitting = false;
        }
      );
  }

}
