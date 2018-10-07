import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {JwtService} from '../services/jwt.service';
import {UserService} from '../services/user.service';
import {ApiEndpoints} from '../services/api-endpoints';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const apiToken = 'Basic dGVzdGp3dGNsaWVudGlkOlhZN2ttem9OemwxMDA=';
    const jwtToken = this.jwtService.getToken();
    const token = jwtToken || apiToken;

    const headers = {
      'Authorization' : token
    };

    console.log(jwtToken);
    console.log(req.url);

    if (!jwtToken && req.url !== ApiEndpoints.OAUTH_TOKEN) {
      this.userService.logout();
    }

    const request = req.clone({setHeaders: headers});

    return next.handle(request);
  }
}
