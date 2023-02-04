const express = require("express");
const cors = require("cors");
const nunjucks = require("nunjucks");

const app = express();
const port = process.env.port || 3001;

const templateEngine = nunjucks.configure("./configs", {
  autoescape: true
});

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000'
}));

function generateConfig(configFormJSON) {
    var hostname = configFormJSON["Hostname"];

    const template = templateEngine.render("40F.fgt", {
      hostname: hostname
    });

    console.log(template)

    return true;
};

app.post('/express_server', (req, res) => {
    res.json({ express: 'YOUR EXPRESS SERVER IS CONNECTED TO REACT' + req.body });
});

app.post("/generate", (req, res) => {
  const configFormJSON = req.body;
  var success = generateConfig(configFormJSON);

  if (success) { 
    return res.json({"success": true});
  } else {
    return res.json({"success": false});
  };
})

app.listen(port, () => console.log(`listening on port ${port}`));