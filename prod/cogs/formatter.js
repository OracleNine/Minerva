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
exports.addIndent = addIndent;
exports.truncateMsg = truncateMsg;
exports.truncateFormatIndent = truncateFormatIndent;
exports.generateResMsg = generateResMsg;
exports.sortVoters = sortVoters;
exports.finalTally = finalTally;
exports.sortQueue = sortQueue;
const kts = __importStar(require("../cogs/kindtostr.js"));
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
    let finalDetails = "";
    details = details.replace("`", "");
    let lineBy = details.split("\n");
    let inCodeBlock = false;
    for (let i = 0; i < lineBy.length; i++) {
        let line = lineBy[i];
        if (line.search(/^[+-].*/) == -1 && line !== "" && line !== "\t") {
            if (inCodeBlock) {
                finalDetails += "```\n";
                inCodeBlock = false;
            }
            finalDetails += "`" + line + "`\n";
        }
        else {
            if (inCodeBlock) {
                finalDetails += line + "\n";
            }
            else {
                finalDetails += "```diff\n";
                finalDetails += line + "\n";
                inCodeBlock = true;
            }
        }
    }
    if (inCodeBlock) {
        finalDetails += "```";
    }
    return finalDetails;
}
function addIndent(text) {
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
function lastIndexOfRegex(expression, target) {
    let lastIndex = -1;
    for (const match of target.matchAll(expression)) {
        lastIndex = match.index;
    }
    return lastIndex + 1;
}
function truncateMsg(text, isDetails) {
    // /^[+-][^\r\n]{1000,}/m
    // /.{1,1800}(?:\.|\?|\!|\;|\,$)/gs
    let returnChunks = [];
    if (text.length < 1800) {
        returnChunks.push(text);
    }
    else {
        if (isDetails) {
            while (text.matchAll(/^[+-][^\r\n]{1000,}/gmd).next().value !== undefined) {
                let runOnResult = text.matchAll(/^[+-][^\r\n]{1000,}/gmd).next().value;
                let runOnCoordinates = runOnResult.indices[0];
                let runOn = text.substring(runOnCoordinates[0], runOnCoordinates[1]);
                let endAt = runOn.matchAll(/^[+-].{0,1000}[\.|\?|\!]/gmd).next().value;
                if (endAt === undefined || endAt === null) {
                    endAt = runOn.matchAll(/^[+-].{0,1000}[\s]/gmd).next().value;
                    if (endAt === undefined || endAt === null) {
                        endAt = new Object();
                        endAt.indices = [[0, 1000], null];
                    }
                }
                let endCoord = endAt.indices[0][1];
                let plusOrMinus = "\n";
                if (runOn.match(/^[+]/g) !== null) {
                    plusOrMinus += "+";
                }
                else {
                    plusOrMinus += "-";
                }
                text = text.slice(0, runOnCoordinates[0] + endCoord) + plusOrMinus + text.slice(runOnCoordinates[0] + endCoord);
            }
        }
        while (text.length > 1800) {
            let toCharLimit = text.substring(0, 1800);
            let chunkEnd = toCharLimit.lastIndexOf("\n");
            if (chunkEnd <= 0) {
                chunkEnd = lastIndexOfRegex(/\.|\!|\?/gm, toCharLimit);
                if (chunkEnd <= 0) {
                    chunkEnd = lastIndexOfRegex(/\s/gm, toCharLimit);
                    if (chunkEnd <= 0) {
                        chunkEnd = 1800;
                    }
                }
            }
            let newChunk = text.substring(0, chunkEnd);
            returnChunks.push(newChunk);
            text = text.slice(chunkEnd);
        }
        returnChunks.push(text);
    }
    return returnChunks;
}
function truncateFormatIndent(details, heading) {
    let finalChunks = [];
    let detailsChunks = truncateMsg(details, false);
    if (detailsChunks !== undefined) {
        for (let i = 0; i < detailsChunks.length; i++) {
            let thisChunk = "";
            if (i === 0) {
                thisChunk += heading;
            }
            let indentedDetails = addIndent(detailsChunks[i]);
            thisChunk += indentedDetails;
            finalChunks.push(thisChunk);
        }
    }
    return finalChunks;
}
function generateResMsg(proposal) {
    let fullResolutionText = [];
    if (proposal.kind === "amd_official") {
        let firstHeading = "### Summary of Amendment\n";
        let secondHeading = "### Details of Amendment\n";
        let fullSummaryText = truncateFormatIndent(proposal.summary, firstHeading);
        fullResolutionText.push(...fullSummaryText);
        // Render details
        let detailsChunks = truncateMsg(proposal.details, true);
        if (detailsChunks !== undefined) {
            for (let i = 0; i < detailsChunks.length; i++) {
                let thisChunk = "";
                if (i === 0) {
                    thisChunk += secondHeading;
                }
                let formattedDetails = formatDetails(detailsChunks[i]);
                let indentedDetails = addIndent(formattedDetails);
                thisChunk += indentedDetails;
                fullResolutionText.push(thisChunk);
            }
        }
    }
    else if (proposal.kind === "inj_rp" || proposal.kind === "inj_ip" || proposal.kind === "inj_member") {
        let firstHeading = "### Description of Incident\n";
        let secondHeading = "### Preferential Outcome\n";
        // Render description of incident
        let descriptionOfIncident = truncateFormatIndent(proposal.details, firstHeading);
        fullResolutionText.push(...descriptionOfIncident);
        // Render preferential outcome
        let preferentialOutcome = truncateFormatIndent(proposal.desire, secondHeading);
        fullResolutionText.push(...preferentialOutcome);
    }
    else if (proposal.kind === "gen_decision") {
        let firstHeading = "### Summary of Resolution\n";
        let secondHeading = "### Description of Resolution\n";
        let fullSummaryText = truncateFormatIndent(proposal.summary, firstHeading);
        fullResolutionText.push(...fullSummaryText);
        let descriptionOfResolution = truncateFormatIndent(proposal.desire, secondHeading);
        fullResolutionText.push(...descriptionOfResolution);
    }
    return fullResolutionText;
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
function finalTally(eligiblePeers, currentDate, threshold) {
    // If passed threshold is 0, then the vote is assumed to be still ongoing
    let tallyBody = "";
    let votedYes = 0;
    let votedNo = 0;
    let votedAbstain = 0;
    eligiblePeers = eligiblePeers.sort(sortVoters);
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
    let tallyHeader = "";
    let tallyFooter = "";
    if (threshold > 0) {
        let votePercentage = votedYes / (votedYes + votedNo);
        let resultString = "";
        if (votePercentage > threshold) {
            resultString = "RESOLUTION PASSES";
        }
        else {
            resultString = "RESOLUTION FAILS";
        }
        tallyFooter = `\n\`\`\`
      YES: ${votedYes}
       NO: ${votedNo}
  ABSTAIN: ${votedAbstain}
\`\`\``;
        tallyHeader = `\`\`\`ini
[PEER RESOLUTION] ${currentDate}
FINAL TALLY
\`\`\`\n`;
        tallyFooter += `\`\`\`
   RESULT: ${resultString}
\`\`\``;
    }
    else {
        tallyHeader = `\`\`\`ini
[PEER RESOLUTION] ${currentDate}
🔴 LIVE TALLY
\`\`\`\n`;
    }
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
    finalTally,
    sortQueue
};
//# sourceMappingURL=formatter.js.map