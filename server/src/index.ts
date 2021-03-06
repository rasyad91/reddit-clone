import { ApolloServer } from "apollo-server-express";
import connectRedis from 'connect-redis';
import cors from "cors";
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { COOKIE_NAME, SERVERURL, __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { MyContext } from "./types";
// import { sendEmail } from "./util/sendEmail";

const main = async () => {
    // sendEmail("bob@com", "hello there")
    const conn = await createConnection({
        type: "postgres",
        database: 'lireddit',
        username: 'rasyad',
        password: '',
        logging: true,
        synchronize: true,
        entities: [User, Post]
    })
    
    // const post = (await orm).em.create(Post, {title: "my first post"});
    // (await orm).em.persistAndFlush(post);

    const app = express();
    app.use(cors({
        origin: SERVERURL,
        credentials: true,
    }))

    const RedisStore = connectRedis(session)
    const redis = new Redis()

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redis,
                disableTouch: true,
                disableTTL: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                sameSite: 'lax', //csrf
                secure: __prod__,// if true only works in https
            },

            saveUninitialized: false,
            secret: 'secretsecretsecret', // keep in env variable
            resave: false,
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }): MyContext => ({ req, res, redis })
    });

    apolloServer.applyMiddleware({ app, cors: false });

    app.listen(4000, () => {
        console.log('server started on localhost:4000')
    })
}

main();