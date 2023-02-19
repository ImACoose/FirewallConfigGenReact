const express = require("express");
const cors = require("cors");
const nunjucks = require("nunjucks");
const fs = require("fs");
const { config } = require("process");

const app = express();
const port = process.env.port || 3001;

//sets up the templating engine
const templateEngine = nunjucks.configure("./configs", {
  autoescape: true
});


// allows the server to use CORS to have the local host post to it
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

// converts a /(insert number) to a subnet mask e.g (255.255.255.0)
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

// gets the network address from the ip address and the subnet mask
function getNetworkAddress(ipAddress, subnetMask) {
  const ip = ipAddress.split(".").map(function (num) {
    return parseInt(num, 10);
  });

  const mask = subnetMask.split(".").map(function (num) {
    return parseInt(num, 10);
  });

  const networkAddress = [];

  for (let i = 0; i < 4; i++) {
    networkAddress[i] = ip[i] & mask[i];
  }

  return networkAddress.join(".");
}

// generates a text file with the router configuration
function generateConfig(configFormJSON) {
  // these are all static variables, guaranteed to be passed through upon submission (although some may be empty)
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
    var native_ipv4_cidr = configFormJSON.NativeVLANInformation.CIDR
    var native_vlan_zone = configFormJSON.NativeVLANInformation.Zone
    var lan_interface = interface_map[model];
    var native_ipv4_network_address = getNetworkAddress(native_ipv4_address, native_ipv4_mask);

    // these are the optional variables that may or may not be passed through, and multiple of them may exist
    var zones = {};
    var vlans = {};
    var trusted_interfaces = {};
    var dhcpPools = {};

    console.log(configFormJSON)


    // configIndex refers to each big item being submitted. for example, firewalldefaults, nativevlan and vlaninformation are all 'config indexes'
    for (const configIndex in configFormJSON) {
      console.log("this is the config index " + configIndex)

      // this checks whether the index contains VLANINformation, so it may split VLANInformation4 into VLANInformation and 4
      var configIndexSplit = configIndex.split("VLANInformation");

      // if it does have 'VLANInformation, add it to the vlans table
      if (configIndexSplit[0] === "") {
        vlans[configIndex] = {
          // these are each the values that may be pased through
          vlan_id: configFormJSON[configIndex].VLANID,
          ipv4_address: configFormJSON[configIndex].IPv4Address,
          ipv4_mask: cidrToSubnetMask(`0.0.0.0${configFormJSON[configIndex].CIDR}`),
          dhcpv4_enabled: configFormJSON[configIndex].DHCPv4Enabled,
          zone: configFormJSON[configIndex].Zone,
          ipv4_cidr: configFormJSON[configIndex].CIDR,
          ipv4_network_address: getNetworkAddress(configFormJSON[configIndex].IPv4Address, cidrToSubnetMask(`0.0.0.0${configFormJSON[configIndex].CIDR}`))
        };
        

        if (zones[configFormJSON[configIndex].Zone]) {
          zones[configFormJSON[configIndex].Zone] = zones[configFormJSON[configIndex].Zone] + ` "VLAN${configFormJSON[configIndex].VLANID}"`;
        } else {
          zones[configFormJSON[configIndex].Zone] = `"VLAN${configFormJSON[configIndex].VLANID}"`;
        };

        // if DHCPv4 enabled is true, fill in the start and end address
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

    // add to the zones table if the vlan has zones
    if (zones[configFormJSON.NativeVLANInformation.Zone]) {
      zones[configFormJSON.NativeVLANInformation.Zone] = zones[configFormJSON.NativeVLANInformation.Zone] + ` "${lan_interface}"`;
    } else {
      zones[configFormJSON.NativeVLANInformation.Zone] + ` "${lan_interface}"`;
    }

    // if dhcpv4 is enabled, do stuff on native vlan
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

    // this renders the actual template
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
      secondary_ipv4_dns: secondaryIPv4DNS,
      native_ipv4_cidr: native_ipv4_cidr,
      native_vlan_zone: native_vlan_zone,
      native_ipv4_network_address: native_ipv4_network_address
    });

    fs.writeFile(`./output/${hostname}.fgt`, template, function(err) {
      if (err) {
        success = false;
      };
    }); 

    return success;
};

// upon submission/posting to /generate, the configform is set to the request's body, and the generateConfig function is called on it
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