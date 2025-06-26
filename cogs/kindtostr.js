function kindToStr(elem) {
    switch(elem) {
        case "amd_admin":
            return "Amendment of Administrative Charter";
        case "amd_rp":
            return "Amendment of RP Charter";
        case "amd_format":
            return "Amendment of Formatting Guidelines";
        case "amd_community":
            return "Amendment of Community Guidelines";
        case "app_member":
            return "Application for Membership";
        case "app_peer":
            return "Application for Peerage";
        case "inj_ip":
            return "Injunction on Intellectual Property";
        case "inj_rp":
            return "Injunction on Roleplay Action";
        case "inj_member":
            return "Injunction on User Behavior";
    }
}

module.exports = {
    kindToStr
}