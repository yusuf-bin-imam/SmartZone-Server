const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const { JsonWebTokenError } = require("jsonwebtoken");

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

function verifyJWT(req, res, next) {
  // console.log("token inside the verifyJWT", req.headers.authorization);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    // optionsCollections
    const optionsCollections = client.db("smartZone").collection("products");

    // bookingCollections
    const bookingCollections = client.db("smartZone").collection("bookings");

    // usersCollections
    const usersCollections = client.db("smartZone").collection("users");

    // feedback collection
    const feedbackCollection = client.db("smartZone").collection("feedbacks");

    // productCollections
    const productCollections = client.db("smartZone").collection("products");

    // categoryCollections
    const categoryCollections = client
      .db("smartZone")
      .collection("productCategory");

    // verify admin
    // const verifyAdmin = async (req, res, next) => {
    //   // console.log("inside verifyAdmin", req.decoded.email);
    //   const decodedEmail = req.decoded.email;
    //   const query = { email: decodedEmail };
    //   const user = await usersCollections.findOne(query);
    //   if (user?.role !== "admin") {
    //     return res.status(403).send({ message: "forbidden access" });
    //   }
    //   next();
    // };

    app.get("/categories", async (req, res) => {
      // console.log("hellow ");
      try {
        const query = {};
        const options = await categoryCollections.find(query).toArray();
        res.send(options);
      } catch (error) {
        console.error(error);
        res.status(500).send(error);
      }
    });

    // brandCategory
    app.get("/brandCategory", async (req, res) => {
      const query = {};
      const result = await categoryCollections
        .find(query)
        .project({ category: 1 })
        .toArray();
      res.send(result);
    });

    /* ---------------------------------- trial --------------------------------- */
    // app.get("/users/:email", async (req, res) => {
    //   const email = req.params.email;
    //   const query = {
    //     category: email,
    //   };
    //   console.log(email);

    //   const userEmail = await usersCollections.find(query).toArray();
    //   res.send(userEmail);
    // });
    // users booking

    // app.get("/bookings", verifyJWT, async (req, res) => {
    //   const email = req.query.email;
    //   console.log(email);
    //   const decodedEmail = req.decoded.email;

    //   if (email !== decodedEmail) {
    //     return res.status(403).send({ message: "forbidden access" });
    //   }

    //   const query = { email: email };
    //   const bookings = await bookingCollections.find(query).toArray();
    //   res.send(bookings);
    // });
    /* ------------------------------- booking api ------------------------------ */
    app.get("/bookings", async (req, res) => {
      const query = {};
      const bookings = await bookingCollections.find(query).toArray();
      res.send(bookings);
    });

    app.get("/bookings/:email", async (req, res) => {
      const email = req.params.email;
      console.log("console hocche ", email);
      const result = await bookingCollections.find({ email: email }).toArray();
      // console.log(result);
      res.send(result);
    });

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      // console.log(booking);
      const result = await bookingCollections.insertOne(booking);
      res.send(result);
    });
    /* --------------------------------- jwt api -------------------------------- */
    // jw token
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollections.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "2h",
        });

        return res.send({ accessToken: token });
      }
      console.log(query);
      res.status(403).send({ accessToken: "" });
    });
    /* ------------------------------ products api ------------------------------ */
    app.get("/products", async (req, res) => {
      const query = {};
      const products = await productCollections.find(query).toArray();
      console.log(products);
      res.send(products);
    });

    //  create product
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productCollections.insertOne(product);
      console.log(result);
      res.send(result);
      // console.log(req);
    });

    app.get("/products/:brand", async (req, res) => {
      const brand = req.params.brand;
      const query = {
        brand: brand,
      };
      // console.log(brand);

      const BrandProducts = await optionsCollections.find(query).toArray();
      // console.log(Brandproducts);
      res.send(BrandProducts);

      // console.log(req.params);
    });

    app.get("/products", async (req, res) => {
      const query = {};
      const options = await optionsCollections.find(query).toArray();
      res.send(options);
    });

    app.get("/myProducts/:email", async (req, res) => {
      const email = req.params.email;

      const query = {
        email: email,
      };
      const myProducts = await productCollections.find(query).toArray();
      // console.log(myProducts);

      res.send(myProducts);
    });

    // delete product from my products
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {
        _id: ObjectId(id),
      };
      const result = await productCollections.deleteOne(filter);
      res.send(result);
    });
    /* -------------------------------- Buyer api ------------------------------- */
    // buyer
    app.get("/buyer", async (req, res) => {
      const query = { role: "buyer" };
      const users = await usersCollections.find(query).toArray();
      res.send(users);
    });

    app.delete("/buyer/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const filter = {
        _id: ObjectId(id),
      };
      const result = await usersCollections.deleteOne(filter);
      res.send(result);
    });

    /* ------------------------------- seller api ------------------------------- */

    // seller
    app.get("/seller", async (req, res) => {
      const query = { role: "seller" };
      const users = await usersCollections.find(query).toArray();
      res.send(users);
    });

    // delete seller
    app.delete("/seller/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const filter = {
        _id: ObjectId(id),
      };
      const result = await usersCollections.deleteOne(filter);
      res.send(result);
    });

    /* -------------------------------- users api ------------------------------- */
    // find users from db
    app.get("/users", async (req, res) => {
      const query = {};
      const users = await usersCollections.find(query).toArray();
      res.send(users);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = {
        email: email,
      };
      const result = await usersCollections.findOne(query);
      console.log(result);
      res.send(result);
    });

    // insert user
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log("user inserted", user);
      const result = await usersCollections.insertOne(user);
      res.send(result);
    });

    // verify admin
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollections.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    // verify seller
    app.get("/users/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollections.findOne(query);
      res.send({ isSeller: user?.role === "seller" });
    });
    // feedback
    app.post("/feedbacks", async (req, res) => {
      const feedback = req.body;
      const result = await feedbackCollection.insertOne(feedback);
      console.log(result);
      res.send(result);
    });

    app.get("/feedbacks", async (req, res) => {
      const query = {};
      const result = await feedbackCollection.find(query).toArray();
      console.log(result);
      res.send(result);
    });
    // api for make admin
    app.put("/users/admin/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const filter = {
        _id: ObjectId(id),
      };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "verified",
        },
      };
      const result = await usersCollections.updateOne(
        filter,
        updateDoc,
        options
      );
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
