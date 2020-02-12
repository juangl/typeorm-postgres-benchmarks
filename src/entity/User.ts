import { Entity, PrimaryGeneratedColumn, OneToMany, BaseEntity } from "typeorm";
import { Education } from "./Education";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToMany(
    type => Education,
    education => education.user,
  )
  education: Promise<Education[]>;
}
