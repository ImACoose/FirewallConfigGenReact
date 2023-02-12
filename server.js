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

const interface_map = {
  "40F": "lan",
  "80F": "internal"
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
    var adminPassword = configFormJSON.FirewallDefaults["AdminPassword"];
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
    var native_dhcpv4_enabled = configFormJSON.NativeVLANInformation["DHCPv4Enabled"];
    var native_dhcpv4_start_address = configFormJSON.NativeVLANInformation["DHCPv4StartAddress"];
    var native_dhcpv4_end_address = configFormJSON.NativeVLANInformation["DHCPv4EndAddress"];
    var lan_interface = interface_map[model];
    var zones = {};
    var vlans = {};
    var trusted_interfaces = {};
    var dhcpPools = {};

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
        };

        if (configFormJSON[configIndex].DHCPv4Enabled) {
          dhcpPools[`VLAN${configFormJSON[configIndex].VLANID}`] = {
            dhcpv4_start_address: configFormJSON[configIndex].DHCPv4StartAddress,
            dhcpv4_end_address: configFormJSON[configIndex].DHCPv4EndAddress,
            gw_address: configFormJSON[configIndex].IPv4Address,
            mask: cidrToSubnetMask(`0.0.0.0${configFormJSON[configIndex].CIDR}`)
          };
        };
      };
    };

    if (zones[configFormJSON.NativeVLANInformation.Zone]) {
      zones[configFormJSON.NativeVLANInformation.Zone] = zones[configFormJSON.NativeVLANInformation.Zone] + ` "${lan_interface}"`;
    } else {
      zones[configFormJSON.NativeVLANInformation.Zone] + ` "${lan_interface}"`;
    }

    if (native_dhcpv4_enabled) {
      dhcpPools[lan_interface] = {
        dhcpv4_start_address: native_dhcpv4_start_address,
        dhcpv4_end_address: native_dhcpv4_end_address,
        gw_address: native_ipv4_address,
        mask: native_ipv4_address
      };
    };

    timezone = timezone_map[timezone];

    console.log(zones)

    var success = true;

    const template = templateEngine.render(`${model}.fgt`, {
      hostname: hostname,
      vlans: vlans,
      timezone: timezone,
      admin_username: adminUsername,
      admin_password: adminPassword,
      upload_kbps: WANUploadKbps,
      download_kbps: WANDownloadKbps,
      native_ipv4_address: native_ipv4_address,
      native_ipv4_mask: native_ipv4_mask,
      zones: zones,
      dhcp_pools: dhcpPools,
      forticloud_email: forticloudAccEmail,
      primary_ipv4_dns: primaryIPv4DNS,
      secondary_ipv4_dns: secondaryIPv4DNS
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