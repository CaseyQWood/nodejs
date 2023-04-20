const {ChatGenerate} = require('./chatGeneration.js') 
const {UpdateDB, NewInstance} = require('./dataBaseQueries.js')
const express = require('express')
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = 3000|| process.env.PORT
// const bodyParser  = require('body-parser');
const { response } = require('express');

app.use(cors());
// app.use(bodyParser.urlencoded());
// app.use(bodyParser.json());
app.use(express.json()); // Used to parse JSON bodies
//app.use(express.urlencoded()); // Parse URL-encoded bodies using query-string library
// or
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies using qs library


app.get('/newSession', (req, res) => {
  console.log("new session")

  NewInstance().then((data) => {
    return res.send({data: data});
  }).catch((err) => {
    console.log("error: ", err)
    return
  })
})

app.get('/hello', (req, res) => {
  res.send('Hello World!')
})

app.post('/', (req, res, next) => {
  
  console.log("Req: ", req.body)
  const sessionID = req.body.id;
  const newPrompt = {role: "user", content: req.body.prompt};
  let promptContext;

  console.log("sessionID: ", sessionID, " newPrompt: ", newPrompt);
  UpdateDB(sessionID, newPrompt).then((data) => {
    console.log("Update DB return data: ", data.rows[0].message.promptContext)

    promptContext = data.rows[0].message.promptContext;

    ChatGenerate(promptContext).then((data) => {
      let newResponse = {role: "assistant", content: generatePrompt(data)};
      UpdateDB(sessionID, newResponse).then((data) => {
        console.log("Update DB return data: ", data.rows[0].message.promptContext.at(-1))
        return res.send({data: data.rows[0].message.promptContext.at(-1)});
      })}).catch((err) => {
        console.log("error: ", err)
        return
      }
    );
  }).catch((err) => {
    console.log("error: ", err)
    return
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

function generatePrompt(prompt) {
  const capitalizedPrompt =
    prompt[0].toUpperCase() + prompt.slice(1).toLowerCase();
  return `${capitalizedPrompt}.`;
}