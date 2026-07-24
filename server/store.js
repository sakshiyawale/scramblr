import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, '..', 'data', 'store.json')
const KV_KEY = 'scramblr:store'

// Vercel's Upstash Redis Marketplace integration injects either naming
// depending on how the store was provisioned/connected.
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
const useKv = Boolean(REDIS_URL && REDIS_TOKEN)
let kvClient

async function getKv() {
  if (!kvClient) {
    const { Redis } = await import('@upstash/redis')
    kvClient = new Redis({ url: REDIS_URL, token: REDIS_TOKEN })
  }
  return kvClient
}

function loadFromDisk() {
  if (!fs.existsSync(DATA_FILE)) return { scores: {}, events: [] }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
  } catch {
    return { scores: {}, events: [] }
  }
}

function saveToDisk(store) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2))
}

/**
 * Vercel Functions are stateless per-invocation, so state can't live in a
 * module-level variable or on local disk in production -- it must round-trip
 * through Vercel KV on every request. Local dev (no KV env vars) keeps using
 * the JSON file so `npm run server` needs no external service.
 */
export async function loadStore() {
  if (useKv) {
    const kv = await getKv()
    const data = await kv.get(KV_KEY)
    return data ?? { scores: {}, events: [] }
  }
  return loadFromDisk()
}

export async function saveStore(store) {
  if (useKv) {
    const kv = await getKv()
    await kv.set(KV_KEY, store)
    return
  }
  saveToDisk(store)
}
