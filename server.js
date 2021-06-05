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
    const result = await trips.insertOne({ name: name })

    console.log(result)
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ err: err })
  }
})

app.delete('/trip', async (req, res) => {
  try {
    const id = new mongo.ObjectId(req.body.id)
    const idIsExist = await trips.findOne({ _id: id })

    if (!idIsExist) {
      console.log('No such _id')
      res.status(400).json({ err: 'No such _id' })
      return
    }

    const { deletedCount } = await trips.deleteOne({ _id: id })

    res.status(200).json({ deletedCount })
  } catch (error) {
    console.error(error)
    res.status(500).json({ err: error })
  }
})

app.get('/trips', async (req, res) => {
  try {
    const items = await trips.find().toArray()
    res.status(200).json({ trips: items })
  } catch (err) {
    console.error(err)
    res.status(500).json({ err: err })
  }
})

app.post('/expense', (req, res) => {
  try {
    await expenses.insertOne({
      trip: req.body.trip,
      date: req.body.date,
      amount: req.body.amount,
      category: req.body.category,
      description: req.body.description
    })
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ err: err })
  }
})

app.get('/expenses', async (req, res) => {
  try {
    const items = await expenses.find({ trip: req.body.trip }).toArray()
    res.status(200).json({ trips: items })
  } catch (err) {
    console.error(err)
    res.status(500).json({ err: err })
  }
})

app.listen(3000, () => console.log('Server ready'))
