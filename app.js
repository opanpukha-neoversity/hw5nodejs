import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import pinoHttp from 'pino-http'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

import authRoutes from './src/routes/auth.routes.js'
import announcementsRoutes from './src/routes/announcements.routes.js'
import logger from './src/logger.js'

const app = express()

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(helmet())

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      const error = new Error('Not allowed by CORS')
      error.status = 403
      return callback(error)
    },
    credentials: true,
  }),
)

app.use(
  pinoHttp({
    logger,
  }),
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Announcements API HW5',
      version: '1.0.0',
      description: 'REST API with auth, Helmet, CORS, rate limit, pino logging and Cloudinary upload.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many requests, please try again later',
    })
  },
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/auth', authLimiter, authRoutes)
app.use('/announcements', announcementsRoutes)

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.use((err, req, res, next) => {
  logger.error({ err }, err.message)

  if (err.name === 'MulterError') {
    return res.status(400).json({ message: err.message })
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`)
  logger.info(`Swagger docs: http://localhost:${PORT}/api-docs`)
})

export default app
