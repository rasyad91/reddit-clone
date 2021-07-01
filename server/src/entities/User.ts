import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@ObjectType()
@Entity()
export class User extends BaseEntity {

    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column({ unique: true })
    username!: string;

    @Field()
    @Column({ unique: true })
    email!: string;

    @Field()
    @Column({ type: "text"})
    password!: string;

    @Field()
    @CreateDateColumn({})
    createdAt: Date = new Date();

    @Field()
    @UpdateDateColumn({})
    updatedAt: Date = new Date();
}