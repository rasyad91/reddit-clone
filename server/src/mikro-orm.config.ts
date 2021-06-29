import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import { User } from "./entities/User";
import path = require("path");

export default {
    migrations: {
        path: path.join(__dirname, "./migrations"),
        pattern: /^[w-]+\d+\.[tj]s$/,
    },
    entities: [Post, User],
    dbName: 'lireddit',
    user: 'rasyad',
    type: 'postgresql',
    debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0] ;
