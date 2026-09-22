const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

const errorHandler = (error, req, res, next) => {
  console.error(error);

  let statusCode = error.statusCode || res.statusCode;

  if (statusCode === 200) {
    statusCode = 500;
  }

  let message = error.message || "Something went wrong.";

  // Invalid MongoDB ObjectId
  if (error.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${error.path}.`;
  }

  // Mongoose validation error
  if (error.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");
  }

  // Duplicate field such as duplicate email
  if (error.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyValue || {})[0] || "field";
    message = `${field} already exists.`;
  }

  // Multer file-size error
  if (error.name === "MulterError") {
    statusCode = 400;
    message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Image must be smaller than 5 MB."
        : error.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: error.stack,
    }),
  });
};

module.exports = {
  notFound,
  errorHandler,
};
