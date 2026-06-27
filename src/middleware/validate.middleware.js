import { deleteLocalFile } from './upload.middleware.js'

export const validate = (schema) => async (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  })

  if (error) {
    await deleteLocalFile(req.file?.path)

    return res.status(400).json({
      message: 'Validation error',
      details: error.details.map((detail) => detail.message),
    })
  }

  req.body = value
  next()
}
