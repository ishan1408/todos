const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have a name"],
  },
  email: {
    type: String,
    required: [true, "A user must have an email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "A user must have a password"],
    select: false
  },
  role: {
    type: String,
    enum: ["user", "admin","guide"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  photo: {
  type: String,
  default: 'default.jpg'
},
  passwordResetToken: String,
  passwordResetExpires: Date,
});

//document middleware - runs before save(), create() > (hooks)
userSchema.pre('save',async function(next){
  // console.log("document middleware is running")
  if(!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password,12) 
  next()
})

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; 

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
