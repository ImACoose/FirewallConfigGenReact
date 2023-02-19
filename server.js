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
};

function isIpAddressInSubnet(ipAddress, subnetMask, targetIpAddress) {
  const ipAddressParts = ipAddress.split('.').map(part => parseInt(part, 10));
  const subnetMaskParts = subnetMask.split('.').map(part => parseInt(part, 10));
  const targetIpAddressParts = targetIpAddress.split('.').map(part => parseInt(part, 10));
  const networkAddressParts = ipAddressParts.map((part, index) => part & subnetMaskParts[index]);

  return networkAddressParts.every((part, index) => part === (targetIpAddressParts[index] & subnetMaskParts[index]));
};

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
    var lan_interface = interface_map[model]; // different firewall models have either lan or internal. this is used to distinguish between
    var native_ipv4_network_address = getNetworkAddress(native_ipv4_address, native_ipv4_mask);

    // these are the optional variables that may or may not be passed through, and multiple of them may exist
    var zones = {};
    var vlans = {};
    var trusted_interfaces = {};
    var dhcpPools = {};
    var firewallPolicies = {};
    var uniqueAddresses = [];

    //console.log(configFormJSON)


    // configIndex refers to each big item being submitted. for example, firewalldefaults, nativevlan and vlaninformation are all 'config indexes'
    for (const configIndex in configFormJSON) {

      // this checks whether the index contains VLANINformation, so it may split VLANInformation4 into VLANInformation and 4
      var configIndexSplit = configIndex.split("VLANInformation");
      var configIndexFirewallSplit = configIndex.split("FirewallPolicyInformation")

      // if it does have 'VLANInformation', add it to the vlans table
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

    for (const configIndex in configFormJSON) {
      var configIndexFirewallSplit = configIndex.split("FirewallPolicyInformation");

      if (configIndexFirewallSplit[0] === ""){
        var source_ipv4_address = configFormJSON[configIndex].SourceIpv4Address

        if (!source_ipv4_address.split("/")[1]) {
          source_ipv4_address = source_ipv4_address + "/32";
        }

        firewallPolicies[configIndexFirewallSplit[1]] = {
          protocol: configFormJSON[configIndex].Protocol,
          port_number: configFormJSON[configIndex].PortNumber,
          source_ipv4_address: source_ipv4_address,
          destination_ipv4_address: configFormJSON[configIndex].DestinationIpv4Address,
          traffic_allowed: configFormJSON[configIndex].TrafficAllowed,
        };

        var fwSourceIPv4 = firewallPolicies[configIndexFirewallSplit[1]].source_ipv4_address;
        var fwDestinationIPv4 = firewallPolicies[configIndexFirewallSplit[1]].destination_ipv4_address;
        var src_zone = null;
        var dst_zone = "wan";

        // getting zone
        for (const vlanIndex in vlans) {
          var vlanIPv4Address = vlans[vlanIndex].ipv4_address;
          var vlanIPv4Mask = vlans[vlanIndex].ipv4_mask;

          // we want to check whether the destination or source address fit in the network, if so use the zone associated with this vlan.
          // if dest does not, it wan

          if (isIpAddressInSubnet(vlanIPv4Address, vlanIPv4Mask, fwSourceIPv4)) {
            src_zone = vlans[vlanIndex].zone;
          };

          if (isIpAddressInSubnet(vlanIPv4Address, vlanIPv4Mask, fwDestinationIPv4)) {
            dst_zone = vlans[vlanIndex].zone;
          };
        };

        if (!src_zone) {
          if (isIpAddressInSubnet(native_ipv4_address, native_ipv4_mask, fwSourceIPv4)) {
            src_zone = native_vlan_zone;
          };
        };

        if (!dst_zone) {
          if (isIpAddressInSubnet(native_ipv4_address, native_ipv4_mask, fwDestinationIPv4)) {
            dst_zone = native_vlan_zone;
          };
        };

        firewallPolicies[configIndexFirewallSplit[1]].src_zone = src_zone;
        firewallPolicies[configIndexFirewallSplit[1]].dst_zone = dst_zone;
      };
    };

    for (const policyIndex in firewallPolicies) {
      const srcIPv4Address = firewallPolicies[policyIndex].source_ipv4_address;
      const dstIPv4Address = firewallPolicies[policyIndex].destination_ipv4_address;
      const srcIPv4AddressNoCIDR = srcIPv4Address.split("/")
      const dstIPv4AddressNoCiDR = dstIPv4Address.split("/")
      var dstStored = false;
      var srcStored = false;

      for (let i = 0; i < uniqueAddresses.length; i++) {
        if (uniqueAddresses[i].objectName == srcIPv4Address) {
          srcStored = true;
        };

        if (uniqueAddresses[i].objectName == dstIPv4Address) {
          dstStored = true;
        };
      };

      if (srcStored == false && srcIPv4Address) { 
        const policyMask = cidrToSubnetMask(`0.0.0.0/${srcIPv4AddressNoCIDR[1]}`)

        uniqueAddresses.push({
          objectName: srcIPv4Address,
          networkAddress: getNetworkAddress(srcIPv4Address, policyMask),
          mask: policyMask
        });
      };

      if (dstStored == false && dstIPv4Address) {
        const policyMask = cidrToSubnetMask(`0.0.0.0/${srcIPv4AddressNoCIDR[1]}`)

        uniqueAddresses.push({
          objectName: dstIPv4Address,
          networkAddress: getNetworkAddress(dstIPv4Address, policyMask),
          mask: policyMask
        });
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