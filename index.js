const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
require("dotenv").config();

const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.petbnp7.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const optionsCollections = client.db("smartZone").collection("products");

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
  } finally {
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("smartzone server running");
});

app.listen(port, () => console.log(`server running on ${port}`));
