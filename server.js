const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.port || 3001;

// This ensures same origin policy won't block the client, who is running on a different port
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000'
}))

function generateConfig(configFormJSON) {
    var hostname = configFormJSON["Hostname"]

    console.log("Hostname: " + hostname)

    return true
}

app.post('/express_server', (req, res) => { //Line 9
    res.json({ express: 'YOUR EXPRESS SERVER IS CONNECTED TO REACT' + req.body }); //Line 10
}); //Line 11

app.post("/generate", (req, res) => {
  const configFormJSON = req.body
  var success = generateConfig(configFormJSON)

  if (success) { 
    return res.json({"success": true})
  } else {
    return res.json({"success": false})
  }
})

app.listen(port, () => console.log(`listening on port ${port}`));
