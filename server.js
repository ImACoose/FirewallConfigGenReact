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

function cidrToSubnetMask(cidr) {
  var mask = "";
  var parts = cidr.split("/");
  var subnet = parts[0];
  var prefix = parseInt(parts[1]);
  
  for (var i = 0; i < 4; i++) {
    if (prefix >= 8) {
      mask += "255.";
      prefix -= 8;
    } else {
      mask += (256 - (1 << 8 - prefix)).toString() + ".";
      prefix = 0;
    }
  }
  
  return mask.substring(0, mask.length - 1);
}

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
    var timezone = configFormJSON.FirewallDefaults["Timezone"];
    var native_ipv4_address = configFormJSON.NativeVLANInformation["IPv4Address"];
    var native_ipv4_mask = cidrToSubnetMask(`0.0.0.0${configFormJSON.NativeVLANInformation.CIDR}`);
    var zones = {};
    var vlans = {};

    console.log(configFormJSON)

    for (const configIndex in configFormJSON) {
      var configIndexSplit = configIndex.split("VLANInformation");

      if (configIndexSplit[0] === "") {
        vlans[configIndex] = {
          vlan_id: configFormJSON[configIndex].VLANID,
          ipv4_address: configFormJSON[configIndex].IPv4Address,
          ipv4_mask: cidrToSubnetMask(`0.0.0.0${configFormJSON[configIndex].CIDR}`),
          dhcpv4_enabled: configFormJSON[configIndex].DHCPv4Enabled,
        };

        if (zones[configFormJSON[configIndex].Zone]) {
          zones[configFormJSON[configIndex].Zone] = zones[configFormJSON[configIndex].Zone] + ` "VLAN${configFormJSON[configIndex].VLANID}"`;
        } else {
          zones[configFormJSON[configIndex].Zone] = `"VLAN${configFormJSON[configIndex].VLANID}"`;
        }
      };
    };

    if (zones[configFormJSON.NativeVLANInformation.Zone]) {
      zones[configFormJSON.NativeVLANInformation.Zone] = zones[configFormJSON.NativeVLANInformation.Zone] + ` "lan"`;
    } else {
      zones[configFormJSON.NativeVLANInformation.Zone] + ` "lan"`;
    }

    timezone = timezone_map[timezone];

    console.log(zones)

    var success = true;

    const template = templateEngine.render(`${model}.fgt`, {
      hostname: hostname,
      vlans: vlans,
      timezone: timezone,
      admin_username: adminUsername,
      upload_kbps: WANUploadKbps,
      download_kbps: WANDownloadKbps,
      native_ipv4_address: native_ipv4_address,
      native_ipv4_mask: native_ipv4_mask,
      zones: zones
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