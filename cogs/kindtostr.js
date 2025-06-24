function kindToStr(elem) {
    switch(elem) {
        case "amd_admin":
            return "Amendment of the Administrative Charter";
        case "amd_rp":
            return "Amendment of the RP Charter";
        case "amd_format":
            return "Amendment of the Formatting Guidelines";
        case "amd_community":
            return "Amendment of the Community Guidelines";
    }
}

module.exports = {
    kindToStr
}