const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      minlength: 4,

    },
    lastname: {
      type: String,
    },

    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password:  {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Gender is not valid");
        }
      },
    },
    photoUrl: {
      type: String,
    },
    comment: {
      type: String,
      default: "This is default Comment",
    },
    skills: {
      type: [String],
    },    
    roleId: {
         type: Number,
          default: 2 
    }, // 1 for admin, 2 for regular user, etc.
          
    companyName: {
            type: String,
          },
          levelId: {
            type: Number,
            default: 1,
          },

  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJWT = async function () {
  const user = this;

  const token = await jwt.sign({ _id: user._id }, "Aahan@123");
  return token;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
