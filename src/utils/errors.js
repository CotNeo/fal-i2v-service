export class HttpError extends Error {
    constructor(status= 500, message = 'Internal Server Error') {
        super(message);
        this.status = status;
    }
}

export const errorMiddleware = (err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: {
      status,
      message: err.message || "Internal Server Error",
    },
  });
};