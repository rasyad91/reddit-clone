import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";

@ObjectType()
@Entity()
export class Post  extends BaseEntity{

    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column({type : "date"})
    createdAt: Date = new Date();

    @Field()
    @CreateDateColumn()
    updatedAt: Date = new Date();

    @Field()
    @UpdateDateColumn({ type: "text" })
    title!: string;

}