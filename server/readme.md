Initializing node and typescript
-- ensure npm and yarn are installed
1) npm init -y
2) yarn add -D @types/node typescript 
    yarn add -D ts-node (decrepated)

3) typescript needs config file => npx tsconfig.json
4)  How to execute typescript files:
    a) "watch": "tsc -w" => watches any changes in the src or typescript file and recompiles to js in dist folder
        then run "node dist/index.js"
    b) "start": "start": "ts-node src/index.ts" => decrepated => slow

5) yarn add -D nodemon
   "dev": "nodemon dist/index.js" => watches for any changes and restart server automatically 

Mikro-ORM DB ORM 
1) yarn add @mikro-orm/cli @mikro-orm/core @mikro-orm/migrations @mikro-orm/postgresql pg
2) 
    const orm = MikroORM.init({
        entites: [],
        dbName: 'lireddit',
        user: 'rasyad91',
        type: 'postgresql',
        debug: !__prod__,
    });
3) set constant in constants.ts => export const __prod__ = process.env.NODE_ENV === "production";
    __prod__ === true when process.env.NODE_ENV === production
4) create mikro-orm.config.ts file
    export default {
    entities: [Post],
    dbName: 'lireddit',
    user: 'rasyad',
    type: 'postgresql',
    debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0] ; => to satisfy ts when importing to index.ts
5) import path from 'path', path.join(__dirname, "./migrations) => joins path
__dirname => absolute path of the file

