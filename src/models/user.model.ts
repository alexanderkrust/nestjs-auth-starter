import { Column, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'users', underscored: true })
export class User extends Model<User> {
  @Column
  email: string;

  @Column
  password: string;
}
