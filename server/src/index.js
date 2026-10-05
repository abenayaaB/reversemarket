import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import meRouter from './routes/me.js'

const app = express()
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || '*' }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))
app.use('/api/me', meRouter)
// Phase 3+: /api/offers (server-side score calculation + validation) mounts here.

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`API listening on :${port}`))
