import { MikroORM } from "@mikro-orm/core"
import { COOKIE_NAME, __prod__ } from "./constants";
// import {Post} from "./entities/Post"
import microConfig from './mikro-orm.config'
import "reflect-metadata";
import express from 'express'
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis'
import { MyContext } from "./types";
import cors from "cors"

const main = async () => {
    const orm = await MikroORM.init(microConfig);
    const migrator = orm.getMigrator();
    await migrator.up();
    // const post = (await orm).em.create(Post, {title: "my first post"});
    // (await orm).em.persistAndFlush(post);

    const app = express();
    app.use(cors({
        origin: "http://localhost:3000",
        credentials: true,
    }))

    const RedisStore = connectRedis(session)
    const redisClient = redis.createClient()

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redisClient,
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
        context: ({ req, res }): MyContext => ({ em: orm.em, req, res })
    });

    apolloServer.applyMiddleware({ app, cors: false });

    app.listen(4000, () => {
        console.log('server started on localhost:4000')
    })
}

main();