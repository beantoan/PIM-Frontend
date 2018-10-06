import {Stock} from './stock.model';

export class InvestmentPeriod {
  id: number;
  stock: Stock;
  startedOn: Date;
  endedOn: Date;
  buyQuantity: number;
  buyAvgPrice: number;
  buyFee: number;
  buyMoney: number;
  sellQuantity: number;
  sellAvgPrice: number;
  sellFee: number;
  sellTax: number;
  sellMoney: number;
}
