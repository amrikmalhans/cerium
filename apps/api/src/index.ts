import Fastify from 'fastify'

const fastify = Fastify({
  logger: true
})

// Declare a route
fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
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
