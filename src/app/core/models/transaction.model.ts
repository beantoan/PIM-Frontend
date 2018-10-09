import {Stock} from './stock.model';

export class Transaction {
  id: string;
  stock: Stock;
  type: number;
  quantity: number;
  price: number;
  fee: number;
  tax: number;
  money: number;
  transactedOn: Date;
}
