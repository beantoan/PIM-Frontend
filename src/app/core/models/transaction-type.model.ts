export class TransactionType {
  public static readonly TYPE_BUY = 1;
  public static readonly TYPE_SELL = 2;
  public static readonly TYPE_MONEY_DIVIDEND = 3;
  public static readonly TYPE_STOCK_DIVIDEND = 4;
  public static readonly TYPE_AWARD_DIVIDEND = 5;

  id: number;
  title: string;
}
