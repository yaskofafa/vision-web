import express from 'express'
import { getStore } from '@netlify/blobs'

const app = express()
app.use(express.json())

// Persist the key -> script mapping in Netlify Blobs so it survives
// cold starts, deploys, and runs across server instances. (The original
// in-memory object was wiped whenever the process restarted.)
const scripts = () => getStore({ name: 'vision-scripts', consistency: 'strong' })

app.get('/key/:id', async (req, res) => {
  const script = (await scripts().get(req.params.id, { type: 'text' })) || ''
  res.type('text/plain').send(script)
})

app.post('/key/:id', async (req, res) => {
  const gameId = req.params.id
  if (!gameId) {
    res.status(400).send('No Game ID Specified')
    return
  }
  await scripts().set(gameId, req.body?.script ?? '')
  res.send('Succesfully Executed')
})

app.listen(process.env.PORT)

// The static site is served from the publish directory; the server only
// needs to handle the key API.
export const config = {
  path: '/key/*',
}
