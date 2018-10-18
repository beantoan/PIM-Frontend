export class TransactionType {
  public static readonly TYPE_BUY = 1;
  public static readonly TYPE_SELL = 2;
  public static readonly TYPE_MONEY_DIVIDEND = 3;
  public static readonly TYPE_STOCK_DIVIDEND = 4;
  public static readonly TYPE_AWARD_DIVIDEND = 5;

  id: number;
  title: string;

  constructor(id: number, title: string) {
    this.id = id;
    this.title = title;
  }

  public static getTypes() {
    return [
      new TransactionType(this.TYPE_BUY, 'Mua'),
      new TransactionType(this.TYPE_SELL, 'Bán'),
      new TransactionType(this.TYPE_MONEY_DIVIDEND, 'Cổ tức tiền'),
      new TransactionType(this.TYPE_STOCK_DIVIDEND, 'Cổ tức cổ phiếu'),
      new TransactionType(this.TYPE_AWARD_DIVIDEND, 'Cổ phiếu thưởng'),
    ];
  }

  public static getType(typeId: number): TransactionType {
    for (const type of this.getTypes()) {
      if (type.id === typeId) {
        return type;
      }
    }

    return null;
  }
}
