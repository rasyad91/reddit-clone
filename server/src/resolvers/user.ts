import { User } from "../entities/User";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { MyContext } from "../types";
import argon2 from 'argon2'
import { EntityManager } from "@mikro-orm/knex";
import { SERVERURL, COOKIE_NAME } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../util/validateRegister";
import { validateLogin } from "../util/validateLogin";
import { sendEmail } from "../util/sendEmail";

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

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg("email") email: string,
        @Ctx() { em }: MyContext,
    ) {
        console.log(email, em)
        const user = await em.findOne(User, {username: email})
        if (!user) return true
        const token = "asdfdsfw3rfsadf"
        await sendEmail(email,
            `<a href="${SERVERURL}/change-password/${token}>Reset Password</a>`,
            )
        return true;
    }

    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { em, req }: MyContext
    ) {
        if (!req.session.userID) return null // you are not logged in
        console.log("req.sessionID: ", req.session.userID)
        const user = await em.findOne(User, { id: req.session.userID })
        return user
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const { username, password, email } = options

        const errors = validateRegister(options)
        if (errors.length !== 0) return { errors: errors }

        const hashedPassword = await argon2.hash(password)
        let user;
        try {
            const result = await (em as EntityManager)
                .createQueryBuilder(User)
                .getKnexQuery()
                .insert({
                    username: username,
                    password: hashedPassword,
                    email: email,
                    created_at: new Date(),
                    updated_at: new Date(),
                }).returning("*")
            user = result[0]
        } catch (err) {
            if (err.detail.includes("already exists")) {
                return { errors: [{ field: "username", message: "username has already taken" }] }
            }
        }
        req.session.userID = user.id
        return { user: user }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const errors = validateLogin(usernameOrEmail, password)
        if (errors.length !== 0 ) {
            return {errors: errors}
        }
        const user = await em.findOne(User,
            usernameOrEmail.includes("@")
                ? { email: usernameOrEmail }
                : { username: usernameOrEmail }
        );
        console.log(user)
        if (!user) return {
            errors: [{
                field: "usernameOrEmail",
                message: "username or email doesn't exist"
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
        return { user }
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() { req, res }: MyContext
    ) {
        return new Promise(resolve =>
            req.session.destroy(err => {
                res.clearCookie(COOKIE_NAME);
                if (err) {
                    console.log(err)
                    return resolve(false)
                }
                return resolve(true)
            }))
    }
}