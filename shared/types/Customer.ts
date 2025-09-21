export interface Customers {
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: number;
  natioMobPourcent: number;
  natioFixPourcent: number;
  interMobPourcent: number;
  interFixPourcent: number;
  ddiPrice: number;
  subscriptions: { definition: string; price: number }[];
  sipLine: { descriptionName: string }[];
  ddiName: { descriptionName: string }[];
}
