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
            Validation: "streetaddress",
        },

        //required, but any characters allowed, 1-20
        SNMPCommunity: {
            ID: "SNMPCommunity",
            InputType: "text",
            Name: "SNMP Community",
            Required: true,
            Validation: "password",
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


    // need a permanent VLAN called 'native vlan', cannot be deleted!!

    NativeVLANInformation: {
        Name: "Native VLAN Information",

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
            InputType: "checkbox",
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
        },

        // displayed when DHCPv4 isn't enabled
        IPHelperAddress: {
            ID: "IPHelperAddress",
            InputType: "text",
            Name: "IPv4 Helper Address",
            Validation: "ipv4",
        },

        Zone: {
            ID: "Zone",
            InputType: "select",
            Name: "Zone",
            SelectOptions: ["Trust", "Untrust"],
        },
    },

    VLANInformation: {
        Name: "Tagged Vlan Information",
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
            InputType: "checkbox",
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
        },

        // displayed when DHCPv4 isn't enabled
        IPHelperAddress: {
            ID: "IPHelperAddress",
            InputType: "text",
            Name: "IPv4 Helper Address",
            Validation: "ipv4",
        },

        Zone: {
            ID: "Zone",
            InputType: "select",
            Name: "Zone",
            SelectOptions: ["Trust", "Untrust"],
        },
    },

    PFInformation: {
        Name: "Port Forwarding Information",

        Protocol: {
            ID: "Protocol",
            InputType: "select",
            Name: "Protocol (TCP/UDP)",
            SelectOptions: ["TCP", "UDP"],
        },
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

        ExPortNumber:{
            ID: "ExPortNumber",
            InputType: "text",
            Name: "External Port Number",
            Validation: "portNo",
        },

        IntPortNumber: {
            ID: "Internal Port Number",
            InputType: "text",
            Name: "Internal Port Number",
            Validation: "portNo",
        },


    },

    VPNInformation: {
        Name: "IP Security VPN Tunnel Information",
        // need a way to break this into sections?
        // IKE Configuration
        RemoteIPv4Address: {
            ID: "RemoteIPv4Address",
            InputType: "text",
            Name: "Remote Ipv4 Address",
            Validation: "ipv4",
        },

        PreSharedKey: {
            ID: "PreSharedKey",
            InputType: "text",
            Name: "Pre-shared Key",
            Validation: "text",
        },

        Encryption: {
            ID: "Encryption",
            InputType: "select",
            Name: "Select Encryption",
            SelectOptions: ["AES-CBC-256", "AES-CBC-128"],
        },

        Authentication: {
            ID: "Authentication",
            InputType: "select",
            Name: "Select Authentication",
            SelectOptions: ["SHA-256", "SHA-512"],
        },

        DHGroup: {
            ID: "DHGroup",
            InputType: "checkboxGroup",
            Name: "Select DH Group",
            checkboxArray: ["1","2","5","14","15","16","17","18","19","20","21","27", "28","29","30","31","32"],
        },

        KeyLifetime: {
            ID: "KeyLifetime",
            InputType: "text",
            Name: "Key Lifetime (Seconds)",
            Validation: "text",
        },

        // IPSecurity Configuration?

        LocalIPv4Address: {
            ID: "LocalIPv4Address",
            InputType: "text",
            Name: "Local Ipv4 Network Address",
            Validation: "ipv4",
        },

        LocalIPv4Subnet: {
            ID: "LocalIPv4Subnet",
            InputType: "select",
            Name: "Local Subnet Prefix",
            SelectOptions: ["/30", "/29", "/28", "/27", "/26", "/25", "/24"],
        },

        RemoteIPv4NetworkAddress: {
            ID: "RemoteIPv4NetworkAddress",
            InputType: "text",
            Name: "Remote Ipv4 Network Address",
            Validation: "ipv4",
        },

        RemoteIPv4Subnet: {
            ID: "RemoteIPv4Subnet",
            InputType: "select",
            Name: "Remote Subnet Prefix",
            SelectOptions: ["/30", "/29", "/28", "/27", "/26", "/25", "/24"],
        },

        Encryption2: {
            ID: "Encryption2",
            InputType: "select",
            Name: "Select Encryption",
            SelectOptions: ["ESP-192-AES", "ESP-256-AES"],
        },

        Authentication2: {
            ID: "Authentication2",
            InputType: "select",
            Name: "Select Authentication",
            SelectOptions: ["ESP-SHA256-HMAC", "ESP-SHA512-HMAC"],
        },

        DH2Group: {
            ID: "DH2Group",
            InputType: "checkboxGroup",
            Name: "Select DH Group",
            checkboxArray: ["1","2","5","14","15","16","17","18","19","20","21","27","28","29","30","31","32"],
        },

        Key2Lifetime: {
            ID: "Key2Lifetime",
            InputType: "text",
            Name: "Key Lifetime (Seconds)",
            Validation: "text",
        },
    },

    FirewallPolicyInformation: {
        Name: "Firewall Policy Information",

        Protocol: {
            ID: "Protocol",
            InputType: "select",
            Name: "Protocol (TCP/UDP)",
            SelectOptions: ["TCP", "UDP"],
        },
        // ipv4 altered - optional, but if something is there, must fit ipv4 regex
        SourceIpv4Address: {
            ID: "SourceIpv4Address",
            InputType: "text",
            Name: "Source Ipv4 Address",
            Validation: "ipv4CIDRAltered",
        },

        DestinationIpv4Address: {
            ID: "DestinationIpv4Address",
            InputType: "text",
            Name: "Destination Ipv4 Address",
            Validation: "ipv4CIDRAltered",
        },

        TrafficAllowed: {
            ID: "TrafficAllowed",
            InputType: "select",
            Name: "Traffic Allowed",
            SelectOptions: ["Allow", "Deny"],
        },

        

    }


}

export default ContainerTypes;