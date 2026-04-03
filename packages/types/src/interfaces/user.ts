export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  cognitoSub: string;
  createdAt: Date;
  updatedAt: Date;
}
