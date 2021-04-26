module.exports = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        message: 'Incomplete or bad formatted client data',
        err: error.details,
      });
    }
  };
};
