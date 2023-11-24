export class DealDto {
  public name: string; // Название сделки
  public price: number; // Сумма сделки

  constructor(name: string, price: number) {
    this.name = name;
    this.price = price;
  }
}
