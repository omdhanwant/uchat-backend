const mongoose = require('mongoose');
const { v4 } = require('uuid');

const USER_TYPES = {
    CONSUMER: "consumer",
    SUPPORT: "support",
  };

  const userSchema = new mongoose.Schema(
    {
      _id: {
        type: String,
        default: () => v4().replace(/\-/g, ""),
      },
      firstName: String,
      lastName: String,
      type: String,
      emailId: String,
      image: String,
      password: String
    },
    {
      timestamps: true,
      collection: "users",
    }
  );

  // add static function to create user
  userSchema.statics.createUser = async function (
	firstName, 
    lastName, 
    type,
    emailId,
    password
) {
  try {
    const user = await this.create({ firstName, lastName, type, emailId,image, password });
    return {
        firstName: user.firstName, 
        lastName: user.lastName, 
        type: user.type, 
        emailId: user.emailId,
        image: user.image,
        id: user._id
    };
  } catch (error) {
    throw error;
  }
}

userSchema.statics.updateUser = async function (user) {
  try {
    const updatedUser = await this.findOneAndUpdate(
      {_id: user._id},
      {$set:user},
      {new:true,
       useFindAndModify: false}).select("-password");
    
    return updatedUser;
  } catch (error) {
    throw error;
  }
}

// function to get user by id
userSchema.statics.getUserById = async function (id) {
    try {
      const user = await this.findOne({ _id: id }, { password: 0} );
      if (!user) throw ({ error: 'No user with this id found' });
      return user;
    } catch (error) {
      throw error;
    }
  }

  // function to get user by id
userSchema.statics.getUserByEmailId = async function (emailId) {
    try {
      const user = await this.findOne({ emailId });
      if (!user) throw ({ error: 'No user found' });
      return user;
    } catch (error) {
      throw error;
    }
  }

// function to get users
userSchema.statics.getUsers = async function () {
  try {
    const users = await this.find().select("-password");
    return users;
  } catch (error) {
    throw error;
  }
}  

// delete a user by id
userSchema.statics.deleteByUserById = async function (id) {
    try {
      const result = await this.remove({ _id: id });
      return result;
    } catch (error) {
      throw error;
    }
  }

  userSchema.statics.getUserByIds = async function (ids) {
    try {
      const users = await this.find({ _id: { $in: ids } });
      return users;
    } catch (error) {
      throw error;
    }
  }

  exports.UserModel = mongoose.model("User", userSchema);
  exports.USER_TYPES = USER_TYPES;