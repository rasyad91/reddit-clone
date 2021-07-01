import argon2 from 'argon2';
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { v4 } from "uuid";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX, SERVERURL } from "../constants";
import { User } from "../entities/User";
import { MyContext } from "../types";
import { sendEmail } from "../util/sendEmail";
import { validateLogin } from "../util/validateLogin";
import { validateRegister } from "../util/validateRegister";
import { UsernamePasswordInput } from "./UsernamePasswordInput";

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
        @Ctx() { redis }: MyContext,
    ): Promise<Boolean> {
        const user = await User.findOne({ where: { email } })
        if (!user) return true
        const token = v4();
        const tokenExpiry = 10 * 60 * 60
        await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, "ex", tokenExpiry.toString())

        await sendEmail(email,
            `<a href="${SERVERURL}/change-password/${token}">Reset Password</a>`,
        )
        return true;
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg("token") token: string,
        @Arg("newPassword") newPassword: string,
        @Ctx() { redis, req }: MyContext,
    ): Promise<UserResponse> {
        if (newPassword.length < 8) {
            return { errors: [{ field: "newPassword", message: "length must be greater than 8" }] }
        }

        const userID = await redis.get(FORGET_PASSWORD_PREFIX + token)
        if (!userID) {
            return { errors: [{ field: "token", message: "token expired" }] }
        }

        const userIDInt = parseInt(userID)
        const user = await User.findOne({ id: userIDInt })
        if (!user)
            return { errors: [{ field: "token", message: "user no longer exists" }] }

        const hashedPassword = await argon2.hash(newPassword)
        await User.update(
            { id: userIDInt },
            { password: hashedPassword }
        )
        redis.del(FORGET_PASSWORD_PREFIX + token)

        // log in user after changed password
        req.session.userID = user.id;

        return { user: user }
    }

    @Query(() => User, { nullable: true })
    me(
        @Ctx() { req }: MyContext
    ) {
        if (!req.session.userID) return undefined  // you are not logged in
        return User.findOne(req.session.userID)
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {req }: MyContext
    ): Promise<UserResponse> {
        const { username, password, email } = options
        const errors = validateRegister(options)
        if (errors.length !== 0) return { errors: errors }

        const hashedPassword = await argon2.hash(password)
        let user;
        try {
            user = await User.create({username, password:hashedPassword, email}).save()
            // const result = await getConnection().createQueryBuilder().insert().into(User).values({
            //     username: username,
            //     password: hashedPassword,
            //     email: email,
            // })
            // .returning("*")
            // .execute()
            // user = result.raw[0]
        } catch (err) {
            if (err.detail.includes("already exists")) {
                return { errors: [{ field: "username", message: "username has already taken" }] }
            }
        }
        req.session.userID = user?.id
        return { user: user }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const errors = validateLogin(usernameOrEmail, password)
        if (errors.length !== 0) {
            return { errors: errors }
        }
        const user = await User.findOne(
            usernameOrEmail.includes("@")
                ? { where: {email: usernameOrEmail} }
                : { where: {username: usernameOrEmail} }
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