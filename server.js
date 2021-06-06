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
      console.err(error)
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
    console.log(result)
    res.status(200).json({ insertedId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ err })
  }
})

app.put('/trip/:id', async (req, res) => {
  try {
    const id = req.params.id
    const newName = req.body.name
    const { modifiedCount } = await trips.updateOne(
      { id },
      { $set: { name: newName } }
    )
    res.status(200).json({ modifiedCount })
  } catch (err) {
    console.error(err)
    res.status(500).json({ err })
  }
})

app.delete('/trip/:id', async (req, res) => {
  try {
    const id = new mongo.ObjectId(req.params.id)
    const { deletedCount } = await trips.deleteOne({ _id: id })
    if (deletedCount) {
      console.error('No trip with such _id')
      res.status(400).json({ err: 'No trip with such _id' })
      return
    }
    res.status(200).json({ deletedCount })
  } catch (error) {
    console.error(err)
    res.status(500).json({ err })
  }
})

app.get('/trips', async (req, res) => {
  try {
    const items = await trips.find().toArray()
    res.status(200).json({ trips: items })
  } catch (err) {
    console.error(err)
    res.status(500).json({ err })
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
    res.status(500).json({ err })
  }
})

app.get('/expenses', async (req, res) => {
  try {
    const items = await expenses.find({ trip: req.body.trip }).toArray()
    res.status(200).json({ trips: items })
  } catch (err) {
    console.error(err)
    res.status(500).json({ err })
  }
})

app.listen(3000, () => console.log('Server ready'))
