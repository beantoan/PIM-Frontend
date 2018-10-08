import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';

@Injectable()
export class Logger {
  static log(tag: string, msg: any) {
    if (!environment.production) {
      console.log(`----------------${tag}----------------`);
      console.log(msg);
      console.log('----------------END----------------');
    }
  }

  static error(tag: string, msg: any) {
    console.error(`----------------${tag}----------------`);
    console.error(msg);
    console.error('----------------END----------------');
  }

  static warn(tag: string, msg: any) {
    console.warn(`----------------${tag}----------------`);
    console.warn(msg);
    console.warn('----------------END----------------');
  }
}