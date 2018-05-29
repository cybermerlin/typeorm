import "reflect-metadata";
import {expect} from "chai";
import {Connection} from "../../../../src";
import {Post} from "./entity/Post";
import {Category} from "./entity/Category";
import {User} from "./entity/User";
import {
    createTestingConnections,
    reloadTestingDatabases,
    closeTestingConnections
} from "../../../utils/test-utils";

describe("persistence > many-to-many.", function() {

    // -------------------------------------------------------------------------
    // Configuration
    // -------------------------------------------------------------------------

    let connections: Connection[];
    before(async () => connections = await createTestingConnections({ __dirname }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => closeTestingConnections(connections));

    // -------------------------------------------------------------------------
    // Specifications
    // -------------------------------------------------------------------------
    it("add exist element to exist object with empty many-to-many relation and save it and it should contain a new category", 
        async () => await Promise.all(connections.map(async connection => {
            const postRepository = connection.getRepository(Post),
                categoryRepository = connection.getRepository(Category),
                userRepository = connection.getRepository(User),
                newCategory = categoryRepository.create(),
                newPost = postRepository.create(),
                newUser = userRepository.create();

            // save a new category
            newCategory.name = "Animals";
            await categoryRepository.save(newCategory);
            // save a new post
            newPost.title = "All about animals";
            await postRepository.save(newPost);
            // save a new user
            newUser.name = "Dima";
            await userRepository.save(newUser);

            if (!newCategory.name) console.warn("newCategory is empty!!!");
            if (!newPost.title) console.warn("newPost is empty!!!");

            // now add a category to the post and attach post to a user and save a user
            newPost.categories = [newCategory];
            await postRepository.save(newPost);

        // load a post
        const loadedUser = await userRepository.findOne(1, {
            join: {
                alias: "user",
                leftJoinAndSelect: { post: "user.post", categories: "post.categories" }
            }
        });
        await connection.close();

        expect(connection.isConnected).to.be.false;
        expect(loadedUser!).not.to.be.empty;
        expect(loadedUser!.post).not.to.be.empty;
        expect(loadedUser!.post.categories).not.to.be.empty;
    })));

    it("remove one element from many-to-many relation should remove from the database as well", () => Promise.all(connections.map(async connection => {

        const postRepository = connection.getRepository(Post);
        const categoryRepository = connection.getRepository(Category);
        const userRepository = connection.getRepository(User);

        // save a new category
        const category1 = new Category();
        category1.name = "Animals";
        await categoryRepository.save(category1);

        // save a new category
        const category2 = new Category();
        category2.name = "Animals";
        await categoryRepository.save(category2);

        // save a new post
        const newPost = postRepository.create();
        newPost.title = "All about animals";
        await postRepository.save(newPost);

        // save a new user
        const newUser = userRepository.create();
        newUser.name = "Dima";
        await userRepository.save(newUser);

        // now categories to the post inside user and save a user
        newPost.categories = [category1, category2];
        newUser.post = newPost;
        await userRepository.save(newUser);

        // load a post
        const loadedUser1 = await userRepository.findOne(1, {
            join: {
                alias: "user",
                leftJoinAndSelect: { post: "user.post", categories: "post.categories" }
            }
        });

        expect(loadedUser1!).not.to.be.empty;
        expect(loadedUser1!.post).not.to.be.empty;
        expect(loadedUser1!.post.categories).not.to.be.empty;
        expect(loadedUser1!.post.categories!.length).to.be.equal(2);

        // now remove added categories
        newPost.categories = [category1];
        newUser.post = newPost;
        await userRepository.save(newUser);

        // load a post
        const loadedUser2 = await userRepository.findOne(1, {
            join: {
                alias: "user",
                leftJoinAndSelect: { post: "user.post", categories: "post.categories" }
            }
        });

        expect(loadedUser2!).not.to.be.empty;
        expect(loadedUser2!.post).not.to.be.empty;
        expect(loadedUser2!.post.categories).not.to.be.empty;
        expect(loadedUser2!.post.categories!.length).to.be.equal(1);

    })));

    it("remove all elements from many-to-many relation should remove from the database as well", () => Promise.all(connections.map(async connection => {

        const postRepository = connection.getRepository(Post);
        const categoryRepository = connection.getRepository(Category);
        const userRepository = connection.getRepository(User);

        // save a new category
        const category1 = new Category();
        category1.name = "Animals";
        await categoryRepository.save(category1);

        // save a new category
        const category2 = new Category();
        category2.name = "Animals";
        await categoryRepository.save(category2);

        // save a new post
        const newPost = postRepository.create();
        newPost.title = "All about animals";
        await postRepository.save(newPost);

        // save a new user
        const newUser = userRepository.create();
        newUser.name = "Dima";
        await userRepository.save(newUser);

        // now categories to the post inside user and save a user
        newPost.categories = [category1, category2];
        newUser.post = newPost;
        await userRepository.save(newUser);

        // load a post
        const loadedUser1 = await userRepository.findOne(1, {
            join: {
                alias: "user",
                leftJoinAndSelect: { post: "user.post", categories: "post.categories" }
            }
        });

        expect(loadedUser1!).not.to.be.empty;
        expect(loadedUser1!.post).not.to.be.empty;
        expect(loadedUser1!.post.categories).not.to.be.empty;
        expect(loadedUser1!.post.categories!.length).to.be.equal(2);

        // now remove added categories
        newPost.categories = [];
        newUser.post = newPost;
        await userRepository.save(newUser);

        // load a post
        const loadedUser2 = await userRepository.findOne(1, {
            join: {
                alias: "user",
                leftJoinAndSelect: { post: "user.post", categories: "post.categories" }
            }
        });

        expect(loadedUser2!).not.to.be.empty;
        expect(loadedUser2!.post).not.to.be.empty;
        expect(loadedUser2!.post.categories!.length).to.be.equal(0);

    })));

    it("remove all elements (set to null) from many-to-many relation should remove from the database as well", () => Promise.all(connections.map(async connection => {

        const postRepository = connection.getRepository(Post);
        const categoryRepository = connection.getRepository(Category);
        const userRepository = connection.getRepository(User);

        // save a new category
        const category1 = new Category();
        category1.name = "Animals";
        await categoryRepository.save(category1);

        // save a new category
        const category2 = new Category();
        category2.name = "Animals";
        await categoryRepository.save(category2);

        // save a new post
        const newPost = postRepository.create();
        newPost.title = "All about animals";
        await postRepository.save(newPost);

        // save a new user
        const newUser = userRepository.create();
        newUser.name = "Dima";
        await userRepository.save(newUser);

        // now categories to the post inside user and save a user
        newPost.categories = [category1, category2];
        newUser.post = newPost;
        await userRepository.save(newUser);

        // load a post
        const loadedUser1 = await userRepository.findOne(1, {
            join: {
                alias: "user",
                leftJoinAndSelect: { post: "user.post", categories: "post.categories" }
            }
        });

        expect(loadedUser1!).not.to.be.empty;
        expect(loadedUser1!.post).not.to.be.empty;
        expect(loadedUser1!.post.categories).not.to.be.empty;
        expect(loadedUser1!.post.categories!.length).to.be.equal(2);

        // now remove added categories
        newPost.categories = null;
        newUser.post = newPost;
        await userRepository.save(newUser);

        // load a post
        const loadedUser2 = await userRepository.findOne(1, {
            join: {
                alias: "user",
                leftJoinAndSelect: { post: "user.post", categories: "post.categories" }
            }
        });

        expect(loadedUser2!).not.to.be.empty;
        expect(loadedUser2!.post).not.to.be.empty;
        expect(loadedUser2!.post.categories!.length).to.be.equal(0);
    })));

    it("remove all elements from many-to-many relation if parent entity is removed", () => Promise.all(connections.map(async connection => {

        // save a new category
        const category1 = new Category();
        category1.name = "Animals";
        await connection.manager.save(category1);

        // save a new category
        const category2 = new Category();
        category2.name = "Animals";
        await connection.manager.save(category2);

        // save a new post
        const newPost = new Post();
        newPost.title = "All about animals";
        await connection.manager.save(newPost);

        // now categories to the post inside user and save a user
        newPost.categories = [category1, category2];
        await connection.manager.save(newPost);

        // this should not give an error:
        await connection.manager.remove(newPost);
    })));
});
