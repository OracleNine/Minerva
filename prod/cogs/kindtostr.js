"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kindToStr = kindToStr;
exports.determineThreshold = determineThreshold;
exports.determineVoterState = determineVoterState;
exports.voterStateToEmoji = voterStateToEmoji;
const config_json_1 = require("../config.json");
function kindToStr(elem) {
    switch (elem) {
        case "amd_official":
            return "Amendment of Official Document(s)";
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
        case "gen_decision":
            return "General Peer Decision";
    }
}
function determineThreshold(elem) {
    switch (elem) {
        case "gen_decision":
            return 1 / 2;
        case "amd_official":
            return 2 / 3;
        case "app_member":
            return 1 / 2;
        case "app_peer":
            return 1 / 2;
        case "inj_ip":
            return 1 / 2;
        case "inj_rp":
            return 1 / 2;
        case "inj_member":
            return 1 / 2;
    }
}
function determineVoterState(elem) {
    switch (elem) {
        case "vote_yes":
            return 1;
        case "vote_no":
            return 2;
        case "vote_abstain":
            return 3;
        case "vote_absent":
            return 0;
    }
}
function voterStateToEmoji(elem) {
    switch (elem) {
        case 1:
            return `<:yes:${config_json_1.yes}>`;
        case 2:
            return `<:no:${config_json_1.no}>`;
        case 3:
            return `<:abstain:${config_json_1.abstain}>`;
        case 0:
            return `<:void:${config_json_1.absent}>`;
    }
}
//# sourceMappingURL=kindtostr.js.map