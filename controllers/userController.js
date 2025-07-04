const User = require("../models/User");
const APIFeatures = require("../utils/apiFeatures");
const Factory = require("../controllers/handlerFactory")
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();


const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new Error('Not an image! Please upload only images.'), false);
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

const catchAsync = require('../utils/catchAsync');

exports.uploadUserPhoto = upload.single('photo');

exports.updateMe = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;
  const updateFields = { name, email };
  
  if (req.file) updateFields.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, updateFields, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

exports.getAllUsers = async (req, res) => {
  try {
    const features = new APIFeatures(User.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const users = await features.query;

    res.status(200).json({
      status: "success",
      results: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = (req,res,next) => {
  req.params.id = req.user.id
  next()
}

exports.getUser = Factory.getOne(User);


exports.createUser = Factory.createOne(User)

exports.updateUser = Factory.deleteOne(User);

exports.deleteUser = Factory.deleteOne(User);

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }

    const token = signToken(user._id);

    res.status(200).json({
      status: "success",
      token,
    });
  } catch (err) {
    next(err);
  }
};
