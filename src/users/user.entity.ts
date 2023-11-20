import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Report } from '../reports/report.entity';

@Entity() // allows typeORM to use User class as an entity, for updating DB
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  admin: boolean;

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

  // Hooks, that will only be executed when Repo is
  // saved with User Entity Instance, not just any object
  @AfterInsert()
  logInsert() {
    console.log(`Inserted User with ${this.id}`);
  }

  @AfterUpdate()
  logUpdate() {
    console.log(`Updated User with ${this.id}`);
  }

  @AfterRemove()
  logRemove() {
    console.log(`Removed User with ${this.id}`);
  }
}
