import {Injectable} from '@angular/core';

import {ApiService} from './api.service';
import {ApiEndpoints} from './api-endpoints';
import {Logger} from './logger';
import {Observable} from 'rxjs';
import {DashboardData} from '../models/dashboard-data.model';


@Injectable()
export class DashboardService {
  constructor(
    private apiService: ApiService
  ) {
  }

  data(): Observable<DashboardData> {
    Logger.info(DashboardService.name, 'data');

    return this.apiService.get<DashboardData>(ApiEndpoints.DASHBOARD_SUMMARY);
  }
}
