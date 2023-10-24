import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface UserListDoc extends BaseDoc {
  name: string;
  creator: ObjectId;
  members: Array<ObjectId>;
}

export default class UserListConcept {
  public readonly userLists = new DocCollection<UserListDoc>("UserLists");

  async createUserList(name: string, creator: ObjectId, members: Array<ObjectId>) {
    await this.isNameUnique(creator, name);
    const _id = await this.userLists.createOne({ name, creator, members });
    return { msg: "UserList successfully created!", UserList: await this.userLists.readOne({ _id }) };
  }

  async nameToId(name: string, creator: ObjectId) {
    const userList = await this.userLists.readOne({ name: name, creator: creator });
    if (userList === null) {
      throw new NotFoundError(`${creator} does not have a user list named ${name}!`);
    }
    return userList._id;
  }

  async namesToIds(names: Array<string>, creator: ObjectId) {
    const userLists = await this.userLists.readMany({ name: { $in: names }, creator: creator });
    return userLists.map((list) => list._id);
  }

  async idsToNames(ids: ObjectId[]) {
    const userLists = await this.userLists.readMany({ _id: { $in: ids } });
    return userLists.map((list) => list.name);
  }

  async editName(_id: ObjectId, name: string) {
    const list = await this.userLists.readOne({ _id });
    if (list?.name === name) {
      return { msg: "UserList name unchanged!" };
    }
    const creator = list?.creator;
    if (creator === undefined) {
      throw new UserListNotFoundError(_id);
    }
    await this.isNameUnique(creator, name);
    await this.userLists.updateOne({ _id }, { name: name });
    return { msg: "UserList name edited!" };
  }

  async addToUserList(_id: ObjectId, users: Array<ObjectId>) {
    if (users.length === 0) {
      return { msg: "No members added!" };
    }
    const UserList = await this.userLists.readOne({ _id });
    if (UserList === null) {
      throw new UserListNotFoundError(_id);
    }
    await this.userLists.updateOneGeneral({ _id }, { $addToSet: { members: { $each: users } } });
    return { msg: "UserList member added!" };
  }

  async removeFromUserList(_id: ObjectId, user: ObjectId) {
    const UserList = await this.userLists.readOne({ _id });
    if (UserList === null) {
      throw new UserListNotFoundError(_id);
    }
    await this.userLists.updateOneGeneral({ _id }, { $pull: { members: user } });
    return { msg: "UserList member removed!" };
  }

  async getUserListsByCreator(user: ObjectId) {
    const UserLists = await this.userLists.readMany({ creator: user });
    return UserLists;
  }

  async getUserListsByMember(user: ObjectId) {
    const UserLists = await this.userLists.readMany({ members: user });
    return UserLists;
  }

  async getMembers(_id: ObjectId) {
    const UserList = await this.userLists.readOne({ _id });
    if (UserList === null) {
      return [];
    }
    return UserList.members;
  }

  async deleteUserList(_id: ObjectId) {
    await this.userLists.deleteOne({ _id });
    return { msg: "UserList deleted successfully!" };
  }

  async deleteMany(filter: Filter<UserListDoc>) {
    await this.userLists.deleteMany(filter);
    return { msg: "UserLists deleted successfully" };
  }

  async deleteUser(user: ObjectId) {
    await this.userLists.updateMany({ members: user }, { $pull: { members: user } });
    return { msg: "User removed from all user lists" };
  }

  private async isNameUnique(creator: ObjectId, name: string) {
    if (await this.userLists.readOne({ name: name, creator: creator })) {
      throw new NotAllowedError(`Can not create a User List with duplicate name ${name}!`);
    }
  }

  async isCreator(user: ObjectId, _id: ObjectId) {
    const UserList = await this.userLists.readOne({ _id });
    if (!UserList) {
      throw new UserListNotFoundError(_id);
    }
    if (UserList.creator.toString() !== user.toString()) {
      throw new UserListCreatorNotMatchError(user, _id);
    }
  }

  async isNotFriendList(_id: ObjectId) {
    const userList = await this.userLists.readOne({ _id });
    if (userList?.name === "Friends") {
      throw new NotAllowedError("Cannot edit default Friends list");
    }
  }
}

export class UserListNotFoundError extends NotFoundError {
  constructor(public readonly UserList: ObjectId) {
    super("UserList {0} does not exist!", UserList);
  }
}

export class UserListNotMemberError extends NotAllowedError {
  constructor(
    public readonly user: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not a member of UserList {1}!", user, _id);
  }
}

export class UserListCreatorNotMatchError extends NotAllowedError {
  constructor(
    public readonly creator: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the creator of UserList {1}!", creator, _id);
  }
}
