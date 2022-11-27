const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { JsonWebTokenError } = require("jsonwebtoken");
const app = express();
require("dotenv").config();

const port = process.env.PORT || 5000;

// JsonWebToken
const jwt = require("jsonwebtoken");

// middleware
app.use(cors());
app.use(express.json());

// mongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.petbnp7.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    // optionsCollections
    const optionsCollections = client.db("smartZone").collection("products");

    // bookingCollections
    const bookingCollections = client.db("smartZone").collection("bookings");

    // usersCollections
    const usersCollections = client.db("smartZone").collection("users");

    // categoryCollections
    const categoryCollections = client
      .db("smartZone")
      .collection("productCategory");

    app.get("/categories", async (req, res) => {
      const query = {};
      const options = await categoryCollections.find(query).toArray();
      res.send(options);
    });

    app.get("/products", async (req, res) => {
      const query = {};
      const options = await optionsCollections.find(query).toArray();
      res.send(options);
    });

    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        category: id,
      };
      console.log(id);

      const options = await optionsCollections.find(query).toArray();
      res.send(options);
    });

    app.get("/bookings", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = { email: email };
      const bookings = await bookingCollections.find(query).toArray();
      res.send(bookings);
    });

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingCollections.insertOne(booking);
      res.send(result);
    });

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollections.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "2h",
        });
        res.send({ accessToken: token });
      }
      // console.log(query);
      res.status(403).send({ accessToken: "" });
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollections.insertOne(user);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("smartzone server running");
});

app.listen(port, () => console.log(`server running on ${port}`));
