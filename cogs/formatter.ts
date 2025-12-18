import * as kts from "../cogs/kindtostr.js";
import { ProposalObject, VoterObject } from "../structures";
import { peerResolutionClasses } from "../config.json";
import { truncate } from "node:fs";

export function snip(arr: string[], value: string) {
    let i = 0;
    while (i < arr.length) {
        if (arr[i] === value) {
            arr.splice(i, 1);
        } else {
            ++i;
        }
    }
    return arr;
}
export function formatHeader(kind: string, subject: string, author: string, date: string) {
    let resClass= kts.kindToStr(kind);
    author = author.substring(5, author.length);
    let header = `\`\`\`ini
[PEER RESOLUTION] ${date}\n
    CLASS: ${resClass}
  SUBJECT: ${subject}
   AUTHOR: ${author}
\`\`\``
    return header;
}
export function formatDetails(details: string) {
    let finalDetails = "";
    details = details.replace("`", "");
    let lineBy = details.split("\n");
    let inCodeBlock = false;

    for (let i = 0; i < lineBy.length; i++) {
        let line = lineBy[i];
        console.log(line);

        if (line!.search(/^[+-].*/) == -1 && line !== "" && line !== "\t") {
            if (inCodeBlock) {
                finalDetails += "```\n";
                inCodeBlock = false;
            }
            finalDetails += "`" + line + "`\n";
        } else {
            if (inCodeBlock) {
                finalDetails += line + "\n";
            } else {
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
export function addIndent(text: string) {
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
export function truncateMsg(text: string) {
    // Text display components have a char limit of 2000. To avoid running into errors, this function splits up the message into 1800 char chunks
    // which is returned as an array. The bot can then iterate through that array until all parts of the message have been sent.
    const txtArr = text.match(/.{1,1800}(?:\n|$)/gs);
    if (txtArr !== null && typeof txtArr !== undefined) {
        return txtArr;
    }
}
export function tfi(details: string, heading: string): string[] {
    // TFI = truncate, format, indent
    let finalChunks = [];
    let detailsChunks = truncateMsg(details);
    if (detailsChunks !== undefined) {
        for (let i = 0; i < detailsChunks.length; i++) {
            let thisChunk = "";
            if (i === 0) {
                thisChunk += heading;
            }
            let indentedDetails = addIndent(detailsChunks[i]!);
            thisChunk += indentedDetails;
            finalChunks.push(thisChunk);
        }
    }

    return finalChunks;
}
export function generateResMsg(proposal: ProposalObject) {
    let fullResolutionText: string[] = [];
    if (proposal.kind === "amd_official") {
        let firstHeading = "### Summary of Amendment\n";
        let secondHeading = "### Details of Amendment\n";

        let fullSummaryText = "";
        fullSummaryText += firstHeading;
        fullSummaryText += proposal.summary
        fullResolutionText.push(addIndent(fullSummaryText));

        // Render details
        let detailsChunks = truncateMsg(proposal.details);
        if (detailsChunks !== undefined) {
            for (let i = 0; i < detailsChunks.length; i++) {
                let thisChunk = "";
                if (i === 0) {
                    thisChunk += secondHeading;
                }
                let formattedDetails = formatDetails(detailsChunks[i]!);
                let indentedDetails = addIndent(formattedDetails);
                thisChunk += indentedDetails;
                fullResolutionText.push(thisChunk);
            }
        }
    } else if (proposal.kind === "inj_rp" || proposal.kind === "inj_ip" || proposal.kind === "inj_member") {
        let firstHeading = "### Description of Incident\n";
        let secondHeading = "### Preferential Outcome\n";

        // Render description of incident
        let descriptionOfIncident = tfi(proposal.details, firstHeading);
        fullResolutionText.push(...descriptionOfIncident);

        // Render preferential outcome
        let preferentialOutcome = tfi(proposal.desire, secondHeading);
        fullResolutionText.push(...preferentialOutcome);

    } else if (proposal.kind === "gen_decision") {
        let firstHeading = "### Summary of Resolution\n";
        let secondHeading = "### Description of Resolution\n";

        let fullSummaryText = "";
        fullSummaryText += firstHeading;
        fullSummaryText = addIndent(proposal.summary);
        fullResolutionText.push(fullSummaryText);

        let descriptionOfResolution = tfi(proposal.details, secondHeading);
        fullResolutionText.push(...descriptionOfResolution);

    }
    return fullResolutionText;
}
export function sortVoters(a: VoterObject,b: VoterObject) {
    if (a.name < b.name) {
        return -1;
    } else if (a.name > b.name) {
        return 1;
    } else {
        return 0;
    }
}
export function formatTally(eligiblePeers: VoterObject[], currentDate: string) {
    let tallyHeader = `\`\`\`ini
[PEER RESOLUTION] ${currentDate}
🔴 LIVE TALLY
\`\`\`\n`
    let tallyBody = "";
    let votedYes = 0;
    let votedNo = 0;
    let votedAbstain = 0;
    eligiblePeers = eligiblePeers.sort(sortVoters); // Voters will always be displayed alphabetically
    for (let i = 0; i < eligiblePeers.length; i++) {
        let stripPrefix = eligiblePeers[i]!.name.substring(5, eligiblePeers[i]!.name.length);
        tallyBody += kts.voterStateToEmoji(eligiblePeers[i]!.voter_state) + ` \`` + stripPrefix + `\`\n`;
        if (eligiblePeers[i]!.voter_state === 1) {
            votedYes++;
        } else if (eligiblePeers[i]!.voter_state === 2) {
            votedNo++;
        } else if (eligiblePeers[i]!.voter_state === 3) {
            votedAbstain++;
        }
    }
    let tallyFooter = `\n\`\`\`
      YES: ${votedYes}
       NO: ${votedNo}
  ABSTAIN: ${votedAbstain}
\`\`\``

    let tallyMsg = tallyHeader + tallyBody + tallyFooter;
    return tallyMsg;
}
export function finalTally(eligiblePeers: VoterObject[], currentDate: string, threshold: number) {
    let tallyHeader = `\`\`\`ini
[PEER RESOLUTION] ${currentDate}
FINAL TALLY
\`\`\`\n`
    let tallyBody = "";
    let votedYes = 0;
    let votedNo = 0;
    let votedAbstain = 0;
    eligiblePeers = eligiblePeers.sort(sortVoters); // Voters will always be displayed alphabetically

    for (let i = 0; i < eligiblePeers.length; i++) {
        let stripPrefix = eligiblePeers[i]!.name.substring(5, eligiblePeers[i]!.name.length);
        tallyBody += kts.voterStateToEmoji(eligiblePeers[i]!.voter_state) + ` \`` + stripPrefix + `\`\n`;
        if (eligiblePeers[i]!.voter_state === 1) {
            votedYes++;
        } else if (eligiblePeers[i]!.voter_state === 2) {
            votedNo++;
        } else if (eligiblePeers[i]!.voter_state === 3) {
            votedAbstain++;
        }
    }
    
    let votePercentage = votedYes / (votedYes + votedNo);
    let resultString = "";
    if (votePercentage > threshold) {
        resultString = "RESOLUTION PASSES";
    } else {
        resultString = "RESOLUTION FAILS";
    }
    let tallyFooter = `\n\`\`\`
      YES: ${votedYes}
       NO: ${votedNo}
  ABSTAIN: ${votedAbstain}
\`\`\`
\`\`\`
   RESULT: ${resultString}
\`\`\``
    let tallyMsg = tallyHeader + tallyBody + tallyFooter;
    return tallyMsg;

}
export function sortQueue(a: ProposalObject, b: ProposalObject) {
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
}