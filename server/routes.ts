import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Comment, CommentSharing, Friend, Post, PostMedia, PostSharing, User, UserList, WebSession } from "./app";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import { includes } from "./framework/utils";
import Responses from "./responses";

class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    const user = await User.create(username, password);
    if (!user.user) {
      throw new Error("User did not create successfully");
    }
    await UserList.createUserList("Friends", user.user._id, []);
    return user;
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);

    // Deleting a user means they approve any pending posts that were still awaiting their approval
    const toBeApproved = await Post.getPendingPostsByApprover(user);
    for (const post of toBeApproved) {
      const result = await Post.approvePost(post._id, user);
      if (result.post && result.msg === "Post successfully published!") {
        await PostSharing.updateResource(post._id, result.post._id);
      }
    }

    // Delete user's UserLists and Friends
    await UserList.deleteMany({ creator: user });
    await UserList.deleteUser(user);
    await Friend.removeUser(user);

    // Delete media and comments under posts that will be deleted
    const deletedPosts = await Post.toBeDeleted(user);
    for (const post of deletedPosts) {
      await PostMedia.delete(post.content);
      await deleteCommentsUnderPost(post._id);
    }

    // Delete user's posts and comments (and the associated sharing resources)
    await Post.deletePostsByAuthor(user);
    await PostSharing.deleteResourcesByOwner(user);
    await Comment.deleteByAuthor(user);
    await CommentSharing.deleteResourcesByOwner(user);

    WebSession.end(session);
    return await User.delete(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts")
  async getPosts(session: WebSessionDoc, author?: string, type?: string) {
    if (type && type === "hidden") {
      return await getHiddenPosts(session);
    } else if (type && type === "pending") {
      return await getPendingPosts(session);
    } else {
      return await getAccessiblePosts(session, author);
    }
  }

  @Router.get("/sharing/posts")
  async getSharedPosts() {
    const resources = await PostSharing.getResources({});
    return Responses.sharedResources(resources);
  }

  @Router.get("/sharing/posts/:_id/members")
  async getPostMembers(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await PostSharing.isOwner(user, _id);
    const resource = await PostSharing.getResource(_id);
    let withAccess = new Set(await User.idsToUsernames(resource.usersWithAccess));
    for (const list of resource.listsWithAccess) {
      const members = await User.idsToUsernames(await UserList.getMembers(list));
      withAccess = new Set([...withAccess, ...members]);
    }
    withAccess.delete("DELETED_USER");
    return Array.from(withAccess);
  }

  @Router.get("/sharing/posts/:_id/requesters")
  async getPostRequesters(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await PostSharing.isOwner(user, _id);
    const resource = await PostSharing.getResource(_id);
    const requested = await User.idsToUsernames(resource.requestedAccess);
    return requested.filter((user) => user !== "DELETED_USER");
  }

  @Router.post("/posts")
  async createPost(
    session: WebSessionDoc,
    imageURL: string,
    caption: string,
    altText: string,
    authors: Array<string>,
    allowRequests: boolean,
    shareWithUsers: Array<string>,
    shareWithLists: Array<string>,
  ) {
    const user = WebSession.getUser(session);
    const authorIds = await User.usernamesToIds(authors);
    if (!includes(authorIds, user)) {
      authorIds.push(user);
    }
    const content = await PostMedia.create(imageURL, caption, altText);
    const created = await Post.create(authorIds, content);
    const shareWithUserIds = await User.usernamesToIds(shareWithUsers);
    const shareWithListIds = await UserList.namesToIds(shareWithLists, user);
    for (const listId of shareWithListIds) {
      await UserList.isCreator(user, listId);
    }
    await PostSharing.limitSharing(authorIds, created.post!._id, allowRequests, shareWithUserIds, shareWithListIds);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.put("/posts/:_id/approve")
  async approvePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const result = await Post.approvePost(_id, user);
    if (result.post && result.msg === "Post successfully published!") {
      await PostSharing.updateResource(_id, result.post._id);
      return { msg: "Post approved and published!", post: await Responses.post(result.post) };
    } else {
      return { msg: "Post approved, still pending other users' approval" };
    }
  }

  @Router.put("/posts/:_id/reject")
  async rejectPost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await PostSharing.deleteByResourceId(_id);
    return await Post.rejectPost(_id, user);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    await PostSharing.deleteByResourceId(_id);
    await deleteCommentsUnderPost(_id);
    const post = await Post.delete(_id);
    await PostMedia.delete(post.deletedPost.content);
    return post;
  }

  @Router.get("/sharing/comments")
  async getSharedComments() {
    const resources = await CommentSharing.getResources({});
    return Responses.sharedResources(resources);
  }

  @Router.post("/posts/:_id/comments")
  async createComment(session: WebSessionDoc, _id: ObjectId, content: string, shareWithUsers: Array<string>, shareWithLists: Array<string>) {
    const author = WebSession.getUser(session);
    const userLists = (await UserList.getUserListsByMember(author)).map((x) => x._id);
    await PostSharing.isAccessible(_id, author, userLists);
    await Post.isPublished(_id);
    const comment = await Comment.create(author, content, _id);
    const shareWithUserIds = await User.usernamesToIds(shareWithUsers);
    const shareWithListIds = await UserList.namesToIds(shareWithLists, author);
    for (const listId of shareWithListIds) {
      await UserList.isCreator(author, listId);
    }
    const postAuthors = (await Post.getAuthors(_id)) ?? [];
    for (const author of postAuthors) {
      if (!includes(shareWithUserIds, author)) {
        shareWithUserIds.push(author);
      }
    }
    await CommentSharing.limitSharing([author], comment.comment!._id, false, shareWithUserIds, shareWithListIds);
    return Responses.comment(comment.comment);
  }

  @Router.get("/posts/:_id/comments")
  async getCommentsByTarget(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const userLists = (await UserList.getUserListsByMember(user)).map((x) => x._id);
    await PostSharing.isAccessible(_id, user, userLists);
    const accessibleComments = await CommentSharing.getResourcesByAccessible(user, userLists);
    const accessibleCommentIds = accessibleComments.map((x) => x.resource);
    const comments = await Comment.getCommentsByTarget(_id, accessibleCommentIds);
    return Responses.comments(comments);
  }

  @Router.delete("/comments/:_id")
  async deleteComment(session: WebSessionDoc, _id: ObjectId) {
    const author = WebSession.getUser(session);
    await Comment.isAuthor(_id, author);
    await CommentSharing.deleteByResourceId(_id);
    return await Comment.delete(_id);
  }

  @Router.get("/friends")
  async getFriends(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.idsToUsernames(await Friend.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: WebSessionDoc, friend: string) {
    const user = WebSession.getUser(session);
    const friendId = (await User.getUserByUsername(friend))._id;
    const userListId = await UserList.nameToId("Friends", user);
    await UserList.removeFromUserList(userListId, friendId);
    const friendUserListId = await UserList.nameToId("Friends", friendId);
    await UserList.removeFromUserList(friendUserListId, user);
    return await Friend.removeFriend(user, friendId);
  }

  @Router.get("/friend/incomingRequests")
  async getIncomingRequests(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Responses.friendRequests(await Friend.getIncomingRequests(user));
  }

  @Router.get("/friend/outgoingRequests")
  async getOutgoingRequests(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Responses.friendRequests(await Friend.getOutgoingRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.sendRequest(user, toId);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.removeRequest(user, toId);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    const userListId = await UserList.nameToId("Friends", user);
    await UserList.addToUserList(userListId, [fromId]);
    const friendUserListId = await UserList.nameToId("Friends", fromId);
    await UserList.addToUserList(friendUserListId, [user]);
    return await Friend.acceptRequest(fromId, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.rejectRequest(fromId, user);
  }

  @Router.get("/userLists")
  async getUserLists(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    const userLists = await UserList.getUserListsByCreator(user);
    return Responses.userLists(userLists);
  }

  @Router.post("/userLists")
  async createUserList(session: WebSessionDoc, name: string, members: Array<string>) {
    const creator = WebSession.getUser(session);
    const membersId = await User.usernamesToIds(members);
    const created = await UserList.createUserList(name, creator, membersId);
    return { msg: created.msg, userList: await Responses.userList(created.UserList) };
  }

  @Router.patch("/userLists/:_id")
  async editUserListName(session: WebSessionDoc, _id: ObjectId, name: string) {
    await UserList.isNotFriendList(_id);
    const creator = WebSession.getUser(session);
    await UserList.isCreator(creator, _id);
    return await UserList.editName(_id, name);
  }

  @Router.post("/userLists/:_id/members")
  async addToUserList(session: WebSessionDoc, _id: ObjectId, users: Array<string>) {
    await UserList.isNotFriendList(_id);
    const creator = WebSession.getUser(session);
    await UserList.isCreator(creator, _id);
    return await UserList.addToUserList(_id, await User.usernamesToIds(users));
  }

  @Router.delete("/userLists/:_id/members/:user")
  async removeFromUserList(session: WebSessionDoc, _id: ObjectId, user: string) {
    await UserList.isNotFriendList(_id);
    const creator = WebSession.getUser(session);
    await UserList.isCreator(creator, _id);
    return await UserList.removeFromUserList(_id, (await User.getUserByUsername(user))._id);
  }

  @Router.delete("/userLists/:_id")
  async deleteUserList(session: WebSessionDoc, _id: ObjectId) {
    await UserList.isNotFriendList(_id);
    const creator = WebSession.getUser(session);
    await UserList.isCreator(creator, _id);
    return await UserList.deleteUserList(_id);
  }

  @Router.post("/sharing/posts/:_id/requests")
  async requestAccess(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    return await PostSharing.requestAccess(_id, user);
  }

  @Router.delete("/sharing/posts/:_id/requests/:requester")
  async rejectRequestAccess(session: WebSessionDoc, _id: ObjectId, requester: string) {
    const user = WebSession.getUser(session);
    await PostSharing.isOwner(user, _id);
    const requesterId = (await User.getUserByUsername(requester))._id;
    return await PostSharing.removeRequest(_id, requesterId);
  }

  @Router.post("/sharing/posts/:_id/members")
  async addUserAccess(session: WebSessionDoc, _id: ObjectId, user: string) {
    const userID = (await User.getUserByUsername(user))._id;
    const owner = WebSession.getUser(session);
    await PostSharing.isOwner(owner, _id);
    return await PostSharing.addUserAccess(_id, userID);
  }

  @Router.delete("/sharing/posts/:_id/members/:user")
  async removeUserAccess(session: WebSessionDoc, _id: ObjectId, user: string) {
    const userID = (await User.getUserByUsername(user))._id;
    const owner = WebSession.getUser(session);
    await PostSharing.isOwner(owner, _id);
    return await PostSharing.removeRequest(_id, userID);
  }

  @Router.post("/sharing/posts/:_id/lists/:list")
  async addListAccess(session: WebSessionDoc, _id: ObjectId, list: string) {
    const owner = WebSession.getUser(session);
    const listID = await UserList.nameToId(list, owner);
    await PostSharing.isOwner(owner, _id);
    return await PostSharing.addListAccess(_id, listID);
  }

  @Router.delete("/sharing/posts/:_id/lists")
  async removeListAccess(session: WebSessionDoc, _id: ObjectId, list: string) {
    const owner = WebSession.getUser(session);
    const listID = await UserList.nameToId(list, owner);
    await PostSharing.isOwner(owner, _id);
    return await PostSharing.removeListAccess(_id, listID);
  }
}

export default getExpressRouter(new Routes());

async function deleteCommentsUnderPost(postId: ObjectId) {
  const deletedComments = await Comment.getCommentsByTarget(postId);
  for (const comment of deletedComments) {
    await CommentSharing.deleteByResourceId(comment._id);
  }
  await Comment.deleteByTarget(postId);
}

async function getPendingPosts(session: WebSessionDoc) {
  const user = WebSession.getUser(session);
  const posts = await Post.getPendingPostsByAuthor(user);
  return Responses.posts(posts);
}

async function getAccessiblePosts(session: WebSessionDoc, author?: string) {
  const user = WebSession.getUser(session);
  const userLists = (await UserList.getUserListsByMember(user)).map((x) => x._id);
  const resources = await PostSharing.getResourcesByAccessible(user, userLists);
  const postIDs = resources.map((record) => record.resource);
  let posts;
  if (author) {
    const authorId = (await User.getUserByUsername(author))._id;
    posts = await Post.getPublishedPosts({ _id: { $in: postIDs }, authors: authorId });
  } else {
    posts = await Post.getPublishedPosts({ _id: { $in: postIDs } });
  }
  return Responses.posts(posts);
}

async function getHiddenPosts(session: WebSessionDoc) {
  const user = WebSession.getUser(session);
  const friends = await Friend.getFriends(user);
  const publishedIds = (await Post.getPublishedPosts({})).map((post) => post._id);
  const hiddenResources = await PostSharing.getResources({ resource: { $in: publishedIds }, allowRequests: true, owners: { $in: friends }, usersWithAccess: { $ne: user } });
  return Responses.sharedResources(hiddenResources);
}
