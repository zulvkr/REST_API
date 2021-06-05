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

app.post('/trip', (req, res) => {
  const name = req.body.name
  trips.insertOne({ name: name }, (err, result) => {
    if (err) {
      console.error(err)
      res.status(500).json({ err: err })
      return
    }
    console.log(result)
    res.status(200).json({ ok: true })
  })
})

app.delete('/trip', async (req, res) => {
  
  try {
    const id = new mongo.ObjectId(req.body.id)
    const idIsExist = await trips.findOne({ _id: id })

    if (!idIsExist) {
      console.log('No such_Id')
      res.status(400).json({ err: 'No such _id' })
      return
    }

    const result = await trips.deleteOne({ _id: id })

    console.log(result)
    res.status(200).json({ ok: result })

  } catch (error) {
    console.error(error)
    res.status(500).json({ err: error })
  }
})

app.get('/trips', (req, res) => {
  trips.find().toArray((err, items) => {
    if (err) {
      console.error(err)
      res.status(500).json({ err: err })
      return
    }
    res.status(200).json({ trips: items })
  })
})

app.post('/expense', (req, res) => {
  expenses.insertOne(
    {
      trip: req.body.trip,
      date: req.body.date,
      amount: req.body.amount,
      category: req.body.category,
      description: req.body.description
    },
    (err, result) => {
      if (err) {
        console.error(err)
        res.status(500).json({ err: err })
        return
      }
      res.status(200).json({ ok: true })
    }
  )
})

app.get('/expenses', (req, res) => {
  expenses.find({ trip: req.body.trip }).toArray((err, items) => {
    if (err) {
      console.error(err)
      res.status(500).json({ err: err })
      return
    }
    res.status(200).json({ trips: items })
  })
})

app.listen(3000, () => console.log('Server ready'))
