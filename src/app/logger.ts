export class Logger {
  static log(tag: string, msg: any) {
    console.log(`${tag}: ${msg}`);
  }

  static error(tag: string, msg: any) {
    console.error(`${tag}: ${msg}`);
  }

  static warn(tag: string, msg: any) {
    console.warn(`${tag}: ${msg}`);
  }
}
