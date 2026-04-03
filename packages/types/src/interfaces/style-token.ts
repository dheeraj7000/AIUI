export interface StyleToken {
  id: string;
  stylePackId: string;
  tokenKey: string;
  tokenType: 'color' | 'radius' | 'font' | 'spacing' | 'shadow' | 'elevation';
  tokenValue: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
