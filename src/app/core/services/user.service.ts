import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, ReplaySubject} from 'rxjs';

import {ApiService} from './api.service';
import {JwtService} from './jwt.service';
import {User} from '../models/user.model';

import {distinctUntilChanged, map, take} from 'rxjs/operators';
import {AuthToken} from '../models/auth-token.model';
import {ApiEndpoints} from './api-endpoints';
import {Logger} from '../../logger.service';


@Injectable()
export class UserService {
  private currentUserSubject = new BehaviorSubject<User>({} as User);
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private jwtService: JwtService
  ) {
  }

  private setUser(user: User) {
    Logger.log('setUser');

    // Set current user data into observable
    this.currentUserSubject.next(user);
    // Set isAuthenticated to true
    this.isAuthenticatedSubject.next(true);
  }

  private setAuthToken(authToken: AuthToken) {
    // Save JWT sent from server in localstorage
    const token = `${authToken.token_type} ${authToken.access_token}`;
    this.jwtService.saveToken(token);
  }

  private purgeAuth() {
    Logger.log('purgeAuth');

    // Remove JWT from localstorage
    this.jwtService.destroyToken();
    // Set current user to an empty object
    this.currentUserSubject.next({} as User);
    // Set auth status to false
    this.isAuthenticatedSubject.next(false);
  }

  // Verify JWT in localstorage with server & load user's info.
  // This runs once on application startup.
  populate() {
    Logger.log('populate');

    // If JWT detected, attempt to get & store user's info
    if (this.jwtService.getToken()) {

      this.apiService.get<User>(ApiEndpoints.USERS_ME)
        .subscribe(
          data => this.setUser(data),
          err => this.purgeAuth()
        );
    } else {
      // Remove any potential remnants of previous auth states
      this.purgeAuth();
    }
  }

  attemptAuth(type, credentials): Observable<AuthToken> {
    Logger.log('attemptAuth');

    credentials.grant_type = 'password';

    const route = (type === 'login') ? ApiEndpoints.OAUTH_TOKEN : ApiEndpoints.USERS;

    return this.apiService.post<AuthToken>(route, credentials)
      .pipe(
        take(1),
        map(data => {
          this.setAuthToken(data);
          return data;
        }
      ));
  }

  getCurrentUser(): User {
    return this.currentUserSubject.value;
  }

  // Update the user on the server (email, pass, etc)
  update(user): Observable<User> {
    return this.apiService
      .put<User>('/user', {user})
      .pipe(map(data => {
        // Update the currentUser observable
        this.setUser(data);
        return data;
      }));
  }

}
