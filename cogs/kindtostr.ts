import { yes, no, abstain, absent } from "../config.json";

export function kindToStr(elem: string) {
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
export function determineThreshold(elem: string) {
    switch(elem) {
        case "amd_admin":
            return 2/3;
        case "amd_rp":
            return 2/3;
        case "amd_format":
            return 2/3;
        case "amd_community":
            return 2/3;
        case "app_member":
            return 1/2;
        case "app_peer":
            return 1/2;
        case "inj_ip":
            return 1/2;
        case "inj_rp":
            return 1/2;
        case "inj_member":
            return 1/2;
    }
}
export function determineVoterState(elem: string) {
    switch(elem) {
        case "vote_yes":
            return 1;
        case "vote_no":
            return 2
        case "vote_abstain":
            return 3;
        case "vote_absent":
            return 0;
    }
}
export function voterStateToEmoji(elem: number) {
    switch(elem) {
        case 1:
            return `<:yes:${yes}>`;
        case 2:
            return `<:no:${no}>`;
        case 3:
            return `<:abstain:${abstain}>`;
        case 0:
            return`<:void:${absent}>`;
    }
}

module.exports = {
    kindToStr,
    determineThreshold,
    determineVoterState
}