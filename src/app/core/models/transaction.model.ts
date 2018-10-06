import {Stock} from './stock.model';

export interface Transaction {
  id: string;
  stock: Stock;
  type: string;
  quantity: number;
  fee: number;
  tax: number;
  money: number;
  transactedOn: Date;
}
