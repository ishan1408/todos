module.exports = (err, req, res, next) => {
  console.error("ERROR 💥", err);

  let statusCode = err.statusCode || 500;
  let status = err.status || 'error';

  if (err.code === 11000) {
    statusCode = 400;
    status = 'fail';
    err.message = 'Duplicate field value entered.';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    status = 'fail';
    err.message = Object.values(err.errors).map(el => el.message).join('. ');
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    status = 'fail';
    err.message = `Invalid ${err.path}: ${err.value}`;
  }

  res.status(statusCode).json({
    status,
    message: err.message || 'Internal Server Error',
  });
};
