import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';

@Injectable()
export class Logger {
  static INFO = 1;
  static WARN = 2;
  static ERROR = 3;

  static printLog(type: number, msg: any) {
    switch (type) {
      case this.INFO:
        console.log(msg);
        break;
      case this.WARN:
        console.warn(msg);
        break;
      case this.ERROR:
        console.error(msg);
        break;
    }
  }

  static log<T>(type: number, className: string, methodName: string, params: T[]) {
    this.printLog(type, `>>> ${className}#${methodName}()`);

    if (params && params.length > 0) {
      for (const param of params) {
        this.printLog(type, param);
      }
      this.printLog(type, 'END <<<');
    }
  }

  static info<T>(className: string, methodName: string, ...params: T[]) {
    if (!environment.production) {
      this.log(this.INFO, className, methodName, params);
    }
  }

  static error<T>(className: string, methodName: string, ...params: T[]) {
    this.log(this.ERROR, className, methodName, params);
  }

  static warn<T>(className: string, methodName: string, ...params: T[]) {
    this.log(this.WARN, className, methodName, params);
  }
}
