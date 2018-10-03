import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {JwtService} from '../services/jwt.service';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {
  constructor(private jwtService: JwtService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const apiToken = 'Basic dGVzdGp3dGNsaWVudGlkOlhZN2ttem9OemwxMDA=';
    const token = this.jwtService.getToken() || apiToken;

    const headers = {
      'Authorization' : token
    };

    const request = req.clone({setHeaders: headers});

    return next.handle(request);
  }
}
