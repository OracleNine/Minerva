"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.snip = snip;
exports.formatHeader = formatHeader;
exports.formatDetails = formatDetails;
exports.formatSummary = formatSummary;
exports.truncateMsg = truncateMsg;
exports.generateResMsg = generateResMsg;
exports.sortVoters = sortVoters;
exports.formatTally = formatTally;
exports.finalTally = finalTally;
exports.sortQueue = sortQueue;
const kts = __importStar(require("../cogs/kindtostr.js"));
const config_json_1 = require("../config.json");
function snip(arr, value) {
    let i = 0;
    while (i < arr.length) {
        if (arr[i] === value) {
            arr.splice(i, 1);
        }
        else {
            ++i;
        }
    }
    return arr;
}
function formatHeader(kind, subject, author, date) {
    let resClass = kts.kindToStr(kind);
    author = author.substring(5, author.length);
    let header = `\`\`\`ini
[PEER RESOLUTION] ${date}\n
    CLASS: ${resClass}
  SUBJECT: ${subject}
   AUTHOR: ${author}
\`\`\``;
    return header;
}
function formatDetails(details) {
    // Put inline quotes around this ^[a-zA-Z0-9].+$
    // Put block quotes around the first and last occurrence of this ^[+|-].*
    let finalDetails = "";
    details = details.replace("`", "");
    let lineBy = details.split("\n");
    let inCodeBlock = false;
    for (let i = 0; i < lineBy.length; i++) {
        let line = lineBy[i];
        if (line.search(/^[a-zA-Z0-9].+$/) != -1 && inCodeBlock === false) {
            finalDetails += "> `" + line + "`\n";
        }
        else if (line.search(/^[a-zA-Z0-9].+$/) != -1 && inCodeBlock === true) {
            finalDetails += "> ```\n";
            inCodeBlock = false;
            finalDetails += "> `" + line + "`\n";
        }
        else if (line.search(/^[+|-].*/) != -1 && inCodeBlock === false) {
            finalDetails += "> ```diff\n";
            finalDetails += "> " + line + "\n";
            inCodeBlock = true;
        }
        else if (line.search(/^[+|-].*/) != -1 && inCodeBlock === true) {
            finalDetails += "> " + line + "\n";
        }
    }
    if (inCodeBlock === true) {
        finalDetails += "> ```";
    }
    return finalDetails;
}
function formatSummary(text) {
    let finalSummary = "";
    let lineBy = text.split("\n");
    for (let i = 0; i < lineBy.length; i++) {
        let line = lineBy[i];
        if (line != "") {
            finalSummary += "> " + line + "\n";
        }
    }
    return finalSummary;
}
function truncateMsg(text) {
    // Text display components have a char limit of 2000. To avoid running into errors, this function splits up the message into 1800 char chunks
    // which is returned as an array. The bot can then iterate through that array until all parts of the message have been sent.
    text += "\n";
    let txtArr = text.match(/[\S\s]{1,1800}[\.|\n|\?|\!]/g);
    if (txtArr !== null) {
        return txtArr;
    }
    else {
        return "Unable to regex message, contact Oracle.";
    }
}
function generateResMsg(proposal) {
    let ffResTxt = [];
    if (config_json_1.peerResolutionClasses.indexOf(proposal.kind) == 0) {
        let truncSummary = truncateMsg(proposal.summary);
        for (let i = 0; i < truncSummary.length; i++) {
            let summaryFormatted = "";
            if (i === 0) {
                summaryFormatted += "> ### Summary of Resolution\n";
            }
            summaryFormatted += formatSummary(truncSummary[i]);
            ffResTxt.push(summaryFormatted);
        }
        let truncDetails = truncateMsg(proposal.details);
        for (let i = 0; i < truncDetails.length; i++) {
            let detailsFormatted = "";
            if (i === 0) {
                detailsFormatted += "> ### Details of Resolution\n";
            }
            detailsFormatted += formatDetails(truncDetails[i]);
            ffResTxt.push(detailsFormatted);
        }
    }
    else if (config_json_1.peerResolutionClasses.indexOf(proposal.kind) >= 3 && config_json_1.peerResolutionClasses.indexOf(proposal.kind) <= 5) {
        let truncDOI = truncateMsg(proposal.details);
        for (let i = 0; i < truncDOI.length; i++) {
            let doiFormatted = "";
            if (i === 0) {
                doiFormatted += "> ### Description of Incident\n";
            }
            doiFormatted += formatSummary(truncDOI[i]);
            ffResTxt.push(doiFormatted);
        }
        let truncDesire = truncateMsg(proposal.desire);
        for (let i = 0; i < truncDesire.length; i++) {
            let desireFormatted = "";
            if (i === 0) {
                desireFormatted += "> ### Preferential Outcome\n";
            }
            desireFormatted += formatSummary(truncDesire[i]);
            ffResTxt.push(desireFormatted);
        }
    }
    else if (config_json_1.peerResolutionClasses.indexOf(proposal.kind) == 6) {
        let truncDecisionSummary = truncateMsg(proposal.summary);
        for (let i = 0; i < truncDecisionSummary.length; i++) {
            let decisionSummaryFormatted = "";
            if (i === 0) {
                decisionSummaryFormatted += "> ### Summary of Decision\n";
            }
            decisionSummaryFormatted += formatSummary(truncDecisionSummary[i]);
            ffResTxt.push(decisionSummaryFormatted);
        }
        let truncDesire = truncateMsg(proposal.desire);
        for (let i = 0; i < truncDesire.length; i++) {
            let desireFormatted = "";
            if (i === 0) {
                desireFormatted += "> ### Preferential Outcome\n";
            }
            desireFormatted += formatSummary(truncDesire[i]);
            ffResTxt.push(desireFormatted);
        }
    }
    return ffResTxt;
}
function sortVoters(a, b) {
    if (a.name < b.name) {
        return -1;
    }
    else if (a.name > b.name) {
        return 1;
    }
    else {
        return 0;
    }
}
function formatTally(eligiblePeers, currentDate) {
    let tallyHeader = `\`\`\`ini
[PEER RESOLUTION] ${currentDate}
🔴 LIVE TALLY
\`\`\`\n`;
    let tallyBody = "";
    let votedYes = 0;
    let votedNo = 0;
    let votedAbstain = 0;
    eligiblePeers = eligiblePeers.sort(sortVoters); // Voters will always be displayed alphabetically
    for (let i = 0; i < eligiblePeers.length; i++) {
        let stripPrefix = eligiblePeers[i].name.substring(5, eligiblePeers[i].name.length);
        tallyBody += kts.voterStateToEmoji(eligiblePeers[i].voter_state) + ` \`` + stripPrefix + `\`\n`;
        if (eligiblePeers[i].voter_state === 1) {
            votedYes++;
        }
        else if (eligiblePeers[i].voter_state === 2) {
            votedNo++;
        }
        else if (eligiblePeers[i].voter_state === 3) {
            votedAbstain++;
        }
    }
    let tallyFooter = `\n\`\`\`
      YES: ${votedYes}
       NO: ${votedNo}
  ABSTAIN: ${votedAbstain}
\`\`\``;
    let tallyMsg = tallyHeader + tallyBody + tallyFooter;
    return tallyMsg;
}
function finalTally(eligiblePeers, currentDate, threshold) {
    let tallyHeader = `\`\`\`ini
[PEER RESOLUTION] ${currentDate}
FINAL TALLY
\`\`\`\n`;
    let tallyBody = "";
    let votedYes = 0;
    let votedNo = 0;
    let votedAbstain = 0;
    eligiblePeers = eligiblePeers.sort(sortVoters); // Voters will always be displayed alphabetically
    for (let i = 0; i < eligiblePeers.length; i++) {
        let stripPrefix = eligiblePeers[i].name.substring(5, eligiblePeers[i].name.length);
        tallyBody += kts.voterStateToEmoji(eligiblePeers[i].voter_state) + ` \`` + stripPrefix + `\`\n`;
        if (eligiblePeers[i].voter_state === 1) {
            votedYes++;
        }
        else if (eligiblePeers[i].voter_state === 2) {
            votedNo++;
        }
        else if (eligiblePeers[i].voter_state === 3) {
            votedAbstain++;
        }
    }
    let votePercentage = votedYes / (votedYes + votedNo);
    let resultString = "";
    if (votePercentage > threshold) {
        resultString = "RESOLUTION PASSES";
    }
    else {
        resultString = "RESOLUTION FAILS";
    }
    let tallyFooter = `\n\`\`\`
      YES: ${votedYes}
       NO: ${votedNo}
  ABSTAIN: ${votedAbstain}
\`\`\`
\`\`\`
   RESULT: ${resultString}
\`\`\``;
    let tallyMsg = tallyHeader + tallyBody + tallyFooter;
    return tallyMsg;
}
function sortQueue(a, b) {
    return a.submitted - b.submitted;
}
module.exports = {
    formatHeader,
    truncateMsg,
    formatDetails,
    generateResMsg,
    snip,
    formatTally,
    finalTally,
    sortQueue
};
//# sourceMappingURL=formatter.js.map