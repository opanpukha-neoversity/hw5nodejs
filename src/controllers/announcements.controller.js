import prisma from '../../prisma/client.js'
import logger from '../logger.js'
import { uploadImageToCloudinary } from '../middleware/upload.middleware.js'

const parseId = (id) => Number.parseInt(id, 10)

export const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    res.json(announcements)
  } catch (error) {
    next(error)
  }
}

export const getAnnouncementById = async (req, res, next) => {
  try {
    const id = parseId(req.params.id)

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid announcement id' })
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id },
    })

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' })
    }

    res.json(announcement)
  } catch (error) {
    next(error)
  }
}

export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, description, price, category, contactInfo } = req.body
    const userId = req.user.id

    let imageUrl = null

    if (req.file) {
      imageUrl = await uploadImageToCloudinary(req.file.path)

      logger.info(
        {
          userId,
          filename: req.file.originalname,
          imageUrl,
        },
        'Announcement photo uploaded',
      )
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        description,
        price,
        category,
        contactInfo,
        imageUrl,
        userId,
      },
    })

    logger.info(
      {
        userId,
        announcementId: announcement.id,
      },
      'Announcement created',
    )

    res.status(201).json(announcement)
  } catch (error) {
    next(error)
  }
}

export const updateAnnouncement = async (req, res, next) => {
  try {
    const id = parseId(req.params.id)
    const userId = req.user.id

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid announcement id' })
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id },
    })

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' })
    }

    if (announcement.userId !== userId) {
      return res.status(403).json({ message: 'You can update only your own announcements' })
    }

    const data = { ...req.body }

    if (req.file) {
      data.imageUrl = await uploadImageToCloudinary(req.file.path)

      logger.info(
        {
          userId,
          announcementId: id,
          filename: req.file.originalname,
          imageUrl: data.imageUrl,
        },
        'Announcement photo uploaded',
      )
    }

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data,
    })

    logger.info(
      {
        userId,
        announcementId: updatedAnnouncement.id,
      },
      'Announcement updated',
    )

    res.json(updatedAnnouncement)
  } catch (error) {
    next(error)
  }
}

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const id = parseId(req.params.id)
    const userId = req.user.id

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid announcement id' })
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id },
    })

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' })
    }

    if (announcement.userId !== userId) {
      return res.status(403).json({ message: 'You can delete only your own announcements' })
    }

    await prisma.announcement.delete({
      where: { id },
    })

    logger.info({ userId, announcementId: id }, 'Announcement deleted')

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
