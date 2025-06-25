exports.createOne = Model => async (req, res, next) => {
  try {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: doc,
    });
  } catch (err) {
    next(err);
  }
};

exports.getOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({
        status: "fail",
        message: "No document found with that ID"
      });
    }

    res.status(200).json({
      status: "success",
      data: doc
    });
  } catch (err) {
    next(err);
  }
};


exports.updateOne = Model => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return res.status(404).json({
        status: "fail",
        message: "Document not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  } catch (err) {
    next(err);
  }
};


exports.deleteOne = Model =>  async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return res.status(404).json({
        status: "fail",
        message: "Tour not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Tour deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
