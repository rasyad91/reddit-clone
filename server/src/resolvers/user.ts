import { User } from "../entities/User";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { MyContext } from "../types";
import argon2 from 'argon2'

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string
    @Field()
    password: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string

    @Field()
    message: string
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: User
}

@Resolver()
export class UserResolver {
    @Query(() => User, {nullable:true})
    async me(
        @Ctx() {em, req}: MyContext
    ){
        if(!req.session.userID) return null // you are not logged in
        console.log("req.sessionID: ", req.session.userID)
        const user = await em.findOne(User, {id: req.session.userID})
        return user
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const { username, password } = options
        const errors = []

        username.length < 2 && errors.push({ field: "username", message: "length must be greater than 2" })

        password.length < 8 && errors.push({ field: "password", message: "length must be greater than 8" })

        if (errors.length !== 0) return { errors: errors }

        const hashedPassword = await argon2.hash(password)
        const user = em.create(User, { username: username, password: hashedPassword })

        try {
            await em.persistAndFlush(user)
        } catch (err) {
            if (err.detail.includes("already exists")) {
                return { errors: [{ field: "username", message: "username has already taken" }] }
            }
        }
        req.session.userID = user.id
        return { user: user }
    }

    @Query(() => UserResponse)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const { username, password } = options
        const user = await em.findOne(User, { username: username })
        if (!user) return {
            errors: [{
                field: "username",
                message: "username doesn't exist"
            }]
        }
        const isvalid = await argon2.verify(user.password, password)
        if (!isvalid) return {
            errors: [{
                field: "password",
                message: "invalid password"
            }]
        }

        req.session.userID = user.id;

        return {
            user
        }
    }
}