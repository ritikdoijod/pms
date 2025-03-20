import z from 'zod';

const objectIdValidationSchema = (message) =>
  z.string().refine((value) => mongoose.isValidObjectId(value), {
    message,
  });

export { objectIdValidationSchema };
