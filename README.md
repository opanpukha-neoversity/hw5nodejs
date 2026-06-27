# Announcements API HW5

REST API with authentication, Helmet, CORS, auth route rate limiting, pino logging and optional announcement image upload to Cloudinary.

## Setup

```bash
npm install
cp .env.example .env
```

Fill `.env` with your PostgreSQL URL, JWT secret and Cloudinary credentials.

```bash
npm run prisma:migrate
npm run dev
```

Server:

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api-docs`
- Health: `http://localhost:3000/health`

## Important implementation details

- `.env` is ignored by Git.
- `uploads/` is used only as temporary storage for multer.
- Uploaded local files are removed after Cloudinary upload.
- Auth routes have a limit of 10 requests per 15 minutes per IP.
- `POST /announcements` and `PATCH /announcements/:id` accept `multipart/form-data` with optional `image` field.
