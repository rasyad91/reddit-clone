import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { Post } from "../entities/Post";

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    // posts(@Ctx() ctx: MyContext )
    async posts(): Promise<Post[]> {
        // await sleep(3000);
        return Post.find();
    }

    @Query(() => Post, { nullable: true })
    post(
        @Arg("id") id: number,
    ): Promise<Post | undefined> {
        return Post.findOne(id);
    }

    @Mutation(() => Post)
    async createPost(
        @Arg("title") title: string,
    ): Promise<Post> {
        return Post.create({title}).save();
    }

    @Mutation(() => Post, {nullable: true})
    async updatePost(
        @Arg("id") id: number,
        @Arg("title", () => String, { nullable: true }) title: string, // setting title as optional
    ): Promise<Post | undefined> {
        const post = Post.findOne(id)
        if (!post) return undefined 
        if (typeof title !== 'undefined') {
            await Post.update({id}, {title}); 
        }
        return post
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg("id") id: number,
    ): Promise<Boolean> {
        if (!Post.findOne(id)) return false 
        await Post.delete({id})
        return true 
    }
}