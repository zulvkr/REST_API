const express = require('express')
const mongo = require('mongodb')

const app = express()
app.use(express.json())

const url = 'mongodb://localhost:27017'

let db, trips, expenses

mongo.connect(
  url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  (err, client) => {
    if (err) {
      console.error(err)
      return
    }
    db = client.db('tripcost')
    trips = db.collection('trips')
    expenses = db.collection('expenses')
  }
)

app.post('/trip', async (req, res) => {
  try {
    const name = req.body.name
    const { insertedId } = await trips.insertOne({ name })
    res.status(200).json({ insertedId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.toString() })
  }
})

app.put('/trip/:id', async (req, res) => {
  try {
    const id = new mongo.ObjectId(req.params.id)
    const newName = req.body.name
    const { modifiedCount, matchedCount } = await trips.updateOne(
      { _id: id },
      { $set: { name: newName } }
    )
    res.status(200).json({ modifiedCount, matchedCount })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.toString() })
  }
})

app.delete('/trip/:id', async (req, res) => {
  try {
    const id = new mongo.ObjectId(req.params.id)
    const { deletedCount } = await trips.deleteOne({ _id: id })
    if (!deletedCount) {
      console.error('No trip with such _id')
      res.status(400).json({ err: 'No trip with such _id' })
      return
    }
    res.status(200).json({ deletedCount })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.toString() })
  }
})

app.get('/trips', async (req, res) => {
  try {
    const items = await trips.find().toArray()
    res.status(200).json({ trips: items })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.toString() })
  }
})

app.post('/expense', async (req, res) => {
  try {
    const { insertedId } = await expenses.insertOne({
      trip: req.body.trip,
      date: req.body.date,
      amount: req.body.amount,
      category: req.body.category,
      description: req.body.description
    })
    res.status(200).json({ insertedId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.toString() })
  }
})

app.get('/expenses', async (req, res) => {
  try {
    const { category, limit = 3, offset = 0, sort } = req.query
    let items = await expenses.find({ trip: req.body.trip }).toArray()
    if (category) {
      items = items.filter(r => r.category === category)
    }
    if (limit) {
      const startIndex = +offset * limit
      const endIndex = startIndex + limit
      items = items.slice(startIndex, endIndex)
    }
    if (sort) {
      switch (sort) {
        case '+amount':
          items = items.sort((a, b) => a.amount - b.amount)
          break
        case '-amount':
          items = items.sort((b, a) => a.amount - b.amount)
          break
      }
    }
    res.status(200).json({ trips: items })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.toString() })
  }
})

app.listen(3000, () => console.log('Server ready'))
