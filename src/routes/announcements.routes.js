import { Router } from 'express'
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
  getAnnouncements,
  updateAnnouncement,
} from '../controllers/announcements.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from '../validators/announcement.validator.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   - name: Announcements
 *     description: Announcement routes
 */

/**
 * @swagger
 * /announcements:
 *   get:
 *     summary: Get all announcements
 *     tags:
 *       - Announcements
 *     responses:
 *       200:
 *         description: List of announcements
 */
router.get('/', getAnnouncements)

/**
 * @swagger
 * /announcements/{id}:
 *   get:
 *     summary: Get announcement by id
 *     tags:
 *       - Announcements
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Announcement found
 *       404:
 *         description: Announcement not found
 */
router.get('/:id', getAnnouncementById)

/**
 * @swagger
 * /announcements:
 *   post:
 *     summary: Create announcement with optional image
 *     tags:
 *       - Announcements
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - category
 *               - contactInfo
 *             properties:
 *               title:
 *                 type: string
 *                 example: Продам велосипед
 *               description:
 *                 type: string
 *                 example: Trek у відмінному стані
 *               price:
 *                 type: number
 *                 example: 8500
 *               category:
 *                 type: string
 *                 example: sale
 *               contactInfo:
 *                 type: string
 *                 example: veloman@gmail.com
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Announcement created
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  validate(createAnnouncementSchema),
  createAnnouncement,
)

/**
 * @swagger
 * /announcements/{id}:
 *   patch:
 *     summary: Update announcement with optional image
 *     tags:
 *       - Announcements
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               contactInfo:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Announcement updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Announcement not found
 */
router.patch(
  '/:id',
  authMiddleware,
  upload.single('image'),
  validate(updateAnnouncementSchema),
  updateAnnouncement,
)

/**
 * @swagger
 * /announcements/{id}:
 *   delete:
 *     summary: Delete announcement
 *     tags:
 *       - Announcements
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Announcement deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Announcement not found
 */
router.delete('/:id', authMiddleware, deleteAnnouncement)

export default router
