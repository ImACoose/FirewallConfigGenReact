// Please read the notes

const ContainerTypes = {
    // Container Type
    FirewallDefaults:
    {
        // This is what is displayed as the header of the form section to the client
        Name: "System Settings",

        // the rest are individual fields displayed to the client
        HostName: {
            ID: "HostName", // how it's referenced for validation
            InputType: "text", // whether it's a text input or select input (haven't accounted for checkboxes yet :( )
            Name: "Hostname", // what is displayed to the client, and sent to the server (hopefully can change that to ID)
            Required: true, //useless i think
            Validation: "text", // the validation type, important for determining which method/regex to use
        },
        
        AdminUsername: {
            ID: "AdminUsername",
            InputType: "text",
            Name: "Admin Username",
            PlaceHolder: "Leave blank to set as default",
            Required: false,
            Validation: "text",
        },
    
        AdminPassword: {
            ID: "AdminPassword",
            InputType: "password",
            Name: "Admin Password",
            Required: true,
            Validation: "password",
        },

        DNSSuffix: {
            ID: "DNSSuffix",
            InputType: "text",
            Name: "DNS Suffix",
            Required: true,
            Validation: "suffix",
        },

        PrimaryIPv4DNS: {
            ID: "PrimaryIPv4DNS",
            InputType: "text",
            Name: "Primary IPv4 DNS Server",
            Required: true,
            Validation: "ipv4",
        },

        SecondaryIpv4DNS: {
            ID: "SecondaryIpv4DNS",
            InputType: "text",
            Name: "Secondary IPv4 DNS Server",
            Required: true,
            Validation: "ipv4",
        },

        Model: {
            ID: "Model",
            InputType: "select",
            Name: "Firewall Model",
            SelectOptions: ["40F", "60F", "80F", "100F"],
            Required: true,
        },

        StreetAddress: {
            ID: "StreetAddress",
            InputType: "text",
            Name: "Street Address",
            Required: true,
            Validation: "text",
        },

        //required, but any characters allowed, 1-20
        SNMPCommunity: {
            ID: "SNMPCommunity",
            InputType: "text",
            Name: "SNMP Community",
            Required: true,
            Validation: "text",
        },
        
        WANConnectionType: {
            ID: "WANConnectionType",
            InputType: "select",
            Name: "WAN Connection Type",
            SelectOptions: ["IPoE", "PPPoE", "Static"],
            Required: true,
        },
    
        WANUploadKBPS: {
            ID: "WANUploadKBPS",
            InputType: "text",
            Name: "WAN Upload Bandwidth (KBPS)",
            Required: true,
            Validation: "bps",
        },

        WANDownloadKBPS: {
            ID: "WANDownloadKBPS",
            InputType: "text",
            Name: "WAN Download Bandwidth (KBPS)",
            Required: true,
            Validation: "bps",
        },

        ForticloudAccEmail: {
            ID: "ForticloudAccEmail",
            InputType: "text",
            Name: "Forticloud Account Email",
            Required: true,
            Validation: "email"
        },
          
        Timezone: {
            ID: "Timezone",
            InputType: "select",
            Name: "Firewall Timezone",
            SelectOptions: ["AEST", "ACST"],
            Required: true,
        },

        checkBoxExample: {
            ID: "checkBoxExample",
            InputType: "checkbox",
            Name: "Test check"
        }
    } ,

    FirewallOptions: {
        Name: "Options",
        newField: {
            InputType: "password",
            Name: "Very Admin",
        },
    },

    VLANInformation: {
        Name: "Vlan Information",
        VLANID: {
            ID: "VLANID",
            InputType: "text",
            Name: "Vlan ID",
            Validation: "vlanId"
        },

        IPv4Address: {
            ID: "IPv4Address",
            InputType: "text",
            Name: "IPv4 Address",
            Validation: "ipv4",
        },

        CIDR: {
            ID: "CIDR",
            InputType: "select",
            Name: "CIDR",
            SelectOptions: ["/30", "/29", "/28", "/27", "/26", "/25", "/24"],
        },

        DHCPv4Enabled: {
            ID: "DHCPv4Enabled",
            InputType: "Checkbox",
            Name: "DHCPv4 Enabled",
        },

        // required/enabled if dhcpv4 is enabled
        DHCPv4StartAddress: {
            ID: "DHCPv4StartAddress",
            InputType: "text",
            Name: "DHCPv4 Start Address",
            Validation: "ipv4",
        },
        // same rules as start address
        DHCPv4EndAddress: {
            ID: "DHCPv4EndAddress",
            InputType: "text",
            Name: "DHCPv4 End Address",
            Validation: "ipv4",
        }


    },

    PortForwardingInfo: {
        Name: "Port Forwarding Information",

        // ipv4 altered - optional, but if something is there, must fit ipv4 regex
        SourceIpv4Address: {
            ID: "SourceIpv4Address",
            InputType: "text",
            Name: "Source Ipv4 Address",
            Validation: "ipv4Altered",
        },

        DestinationIpv4Address: {
            ID: "DestinationIpv4Address",
            InputType: "text",
            Name: "Destination Ipv4 Address",
            Validation: "ipv4",
        },

        PortNumber:{
            ID: "PortNumber",
            InputType: "text",
            Name: "Port Number",
            Validation: "portNo",
        },
    },

    IPSecVPNTunnel: {
        Name: "IP Security VPN Tunnel Information"
    }


}

export default ContainerTypes;