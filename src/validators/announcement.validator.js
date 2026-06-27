import Joi from 'joi'

export const createAnnouncementSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(5).max(2000).required(),
  price: Joi.number().positive().required(),
  category: Joi.string().min(2).max(50).required(),
  contactInfo: Joi.string().min(3).max(255).required(),
})

export const updateAnnouncementSchema = Joi.object({
  title: Joi.string().min(2).max(100),
  description: Joi.string().min(5).max(2000),
  price: Joi.number().positive(),
  category: Joi.string().min(2).max(50),
  contactInfo: Joi.string().min(3).max(255),
})
