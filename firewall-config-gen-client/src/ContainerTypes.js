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
    },

    PortForwardingInfo: {
        Name: "Port Forwarding Information",
    },

    IPSecVPNTunnel: {
        Name: "IP Security VPN Tunnel Information"
    }


}

export default ContainerTypes;