import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import { auth } from './auth'

const fastify = Fastify({
  logger: true
})

// Configure CORS
fastify.register(fastifyCors, {
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With"
  ],
  credentials: true,
  maxAge: 86400
})

// Register Better Auth handler
fastify.register(async function (fastify) {
  fastify.all('/api/auth/*', async (request, reply) => {
    try {
      // Construct request URL
      const url = new URL(request.url, `http://${request.headers.host}`)
      
      // Convert Fastify headers to standard Headers object
      const headers = new Headers()
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString())
      })

      // Create Fetch API-compatible request
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        body: request.body ? JSON.stringify(request.body) : undefined,
      })

      // Process authentication request
      const response = await auth.handler(req)

      // Forward response to client
      reply.status(response.status)
      response.headers.forEach((value, key) => reply.header(key, value))
      reply.send(response.body ? await response.text() : null)

    } catch (error) {
      fastify.log.error(error as Error)
      reply.status(500).send({ 
        error: "Internal authentication error",
        code: "AUTH_FAILURE"
      })
    }
  })
})

// Health check route
fastify.get('/', async (request, reply) => {
  console.log('Health check route')
  return { hello: 'world', auth: 'ready' }
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: 9999 })
    console.log('Server listening on port 9999')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
