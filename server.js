const express = require("express");
const cors = require("cors");
const nunjucks = require("nunjucks");
const fs = require("fs");

const app = express();
const port = process.env.port || 3001;

const templateEngine = nunjucks.configure("./configs", {
  autoescape: true
});

app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000"
}));

function generateConfig(configFormJSON) {
    var hostname = configFormJSON.FirewallDefaults["HostName"];
    var vlans = {};

    console.log(configFormJSON)

    for (const configIndex in configFormJSON) {
      var configIndexSplit = configIndex.split("VLANInformation");

      if (configIndexSplit[0] === "") {
        vlans[configIndex] = {
          vlanID: configFormJSON[configIndex].VLANID
        };
      };
    };

    console.log(vlans)
    
    var success = true;

    const template = templateEngine.render("40F.fgt", {
      hostname: hostname,
      vlans: vlans
    });

    fs.writeFile(`./output/${hostname}.fgt`, template, function(err) {
      if (err) {
        success = false;
      };
    }); 

    return success;
};

app.post("/generate", (req, res) => {
  const configFormJSON = req.body;
  var success = generateConfig(configFormJSON);

  if (success) { 
    res.status(200);
  } else {
    res.status(500);
  };

  return res.json({"success": success});
});

app.listen(port, () => console.log(`listening on port ${port}`));