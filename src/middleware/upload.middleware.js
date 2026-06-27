import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import logger from '../logger.js'

const uploadDir = path.join(process.cwd(), 'uploads')

if (!fsSync.existsSync(uploadDir)) {
  fsSync.mkdirSync(uploadDir, { recursive: true })
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, filename)
  },
})

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'))
  }

  cb(null, true)
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
})

export const deleteLocalFile = async (filePath) => {
  if (!filePath) return

  try {
    await fs.unlink(filePath)
  } catch (error) {
    logger.warn({ error, filePath }, 'Failed to delete temporary upload file')
  }
}

export const uploadImageToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'announcements',
      resource_type: 'image',
    })

    return result.secure_url
  } finally {
    await deleteLocalFile(filePath)
  }
}
