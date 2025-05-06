import express from 'express'
import http from 'http'
import path from 'path'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'
// import dotenv from 'dotenv'

import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { setupSocketAPI } from './services/socket.service.js'
import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'
import { logger } from './services/logger.service.js'

// dotenv.config()

const app = express()
const server = http.createServer(app)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cookieParser())
app.use(express.json())

if (process.env.NODE_ENV !== 'production') {
    const corsOptions = {
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
        credentials: true,
    }
    app.use(cors(corsOptions))
}

app.all('*', setupAsyncLocalStorage)

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

setupSocketAPI(server)

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'public')))

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'public', 'index.html'))
    })
}

if (process.env.NODE_ENV !== 'production') {
    app.get('*', (req, res) => {
        res.status(404).send('API route not found')
    })
}

const port = process.env.PORT || 3030
server.listen(port, () => {
    logger.info(`Server is running on http://localhost:${port}`)
})
