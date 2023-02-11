const express = require("express");
const cors = require("cors");
const nunjucks = require("nunjucks");
const fs = require("fs");
const { config } = require("process");

const app = express();
const port = process.env.port || 3001;

const templateEngine = nunjucks.configure("./configs", {
  autoescape: true
});

app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000"
}));

const timezone_map = {
  ACST: 63,
  AEST: 65
};

function generateConfig(configFormJSON) {
    var hostname = configFormJSON.FirewallDefaults["HostName"];
    var adminUsername = configFormJSON.FirewallDefaults["AdminUsername"];
    var dnsSuffix = configFormJSON.FirewallDefaults["DNSSuffix"];
    var primaryIPv4DNS = configFormJSON.FirewallDefaults["PrimaryIPv4DNS"];
    var secondaryIPv4DNS = configFormJSON.FirewallDefaults["SecondaryIpv4DNS"];
    var model = configFormJSON.FirewallDefaults["Model"];
    var streetAddress = configFormJSON.FirewallDefaults["StreetAddress"];
    var snmpCommunity = configFormJSON.FirewallDefaults["SNMPCommunity"];
    var WANConnectionType = configFormJSON.FirewallDefaults["WANConnectionType"];
    var WANUploadKbps = configFormJSON.FirewallDefaults["WANUploadKBPS"];
    var WANDownloadKbps = configFormJSON.FirewallDefaults["WANDownloadKBPS"];
    var forticloudAccEmail = configFormJSON.FirewallDefaults["ForticloudAccEmail"];
    var timezone = configFormJSON.FirewallDefaults["Timezone"]
    var vlans = {};

    for (const configIndex in configFormJSON) {
      var configIndexSplit = configIndex.split("VLANInformation");

      if (configIndexSplit[0] === "") {
        vlans[configIndex] = {
          vlanID: configFormJSON[configIndex].VLANID
        };
      };
    };

    timezone = timezone_map[timezone];

    console.log(timezone);
    
    var success = true;

    const template = templateEngine.render("40F.fgt", {
      hostname: hostname,
      vlans: vlans,
      timezone: timezone,
      admin_username: adminUsername,
      upload_kbps: WANUploadKbps,
      download_kbps: WANDownloadKbps
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