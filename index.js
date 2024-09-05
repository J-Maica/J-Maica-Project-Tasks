import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import quotes from "success-motivational-quotes"

const app = express();
const port = 3000;
const db = new pg.Client({
  user:"postgres",
  host:"localhost",
  database:"your db",
  password:"your password",
  port:"5432"
})

db.connect()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];

app.get("/",  async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
    items = result.rows;
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
      quote:quotes.getTodaysQuote().body
    });
    // console.log(items)

  } catch (error) {
    // console.log(error)
  }
});

app.post("/add", async (req, res) => {
  const newItem = req.body.newItem;
  const newDetails = req.body.newDetails ? req.body.newDetails : null ;
  const newDuedate = req.body.newDuedate ? req.body.newDuedate : null ;
  try {
    const result = await db.query("INSERT INTO items(task, details, duedate) VALUES ($1, $2, $3)",[newItem, newDetails, newDuedate])
    // console.log(result)
    items.push({ listItems: items});
    res.redirect("/");
  } catch (error) {
    // console.log(error)
  }
});

app.post("/edit", async (req, res) => {
  const task = req.body.updatedItemTask;
  const duedate = req.body.updatedItemDuedate || null;
  const details = req.body.updatedDetails || null;
  const id = req.body.updatedItemId;

  try {
    const result = await db.query("UPDATE items SET task = $1, details = $2, duedate = $3 WHERE id = $4", [task, details, duedate, id]);
    res.redirect("/");
  } catch (error) {
    // console.log(error);
    res.status(500).send("Error updating item");
  }
});

app.post("/delete", async(req, res) => {
  const id = req.body.deleteItemId
  try {
    const result = await db.query("DELETE FROM items WHERE id = $1", [id]);
    res.render("index.ejs",{ listItems: items})
    res.redirect("/")
  } catch (error) {
    // console.log(error)
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
