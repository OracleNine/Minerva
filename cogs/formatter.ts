import * as kts from "../cogs/kindtostr.js";
import { ProposalObject, VoterObject } from "minerva-structures";
import { peerResolutionClasses } from "../config.json";

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
    author = author.substring(4, author.length);
    let header = `\`\`\`ini
[PEER RESOLUTION] ${date}\n
    CLASS: ${resClass}
  SUBJECT: ${subject}
   AUTHOR: ${author}
\`\`\``
    return header;
}
export function formatDetails(details: string) {
    // Put inline quotes around this ^[a-zA-Z0-9].+$
    // Put block quotes around the first and last occurrence of this ^[+|-].*
    let finalDetails = "";
    details = details.replace("`", "");
    let lineBy = details.split("\n");
    let inCodeBlock = false;

    for (let i = 0; i < lineBy.length; i++) {
        let line = lineBy[i];

        if (line!.search(/^[a-zA-Z0-9].+$/) != -1 && inCodeBlock === false) {
            finalDetails += "> `" + line + "`\n";
        } else if (line!.search(/^[a-zA-Z0-9].+$/) != -1 && inCodeBlock === true) {
            finalDetails += "> ```\n"
            inCodeBlock = false;
            finalDetails += "> `" + line + "`\n";
        } else if (line!.search(/^[+|-].*/) != -1 && inCodeBlock === false) {
            finalDetails += "> ```diff\n";
            finalDetails += "> " + line + "\n";
            inCodeBlock = true;
        } else if (line!.search(/^[+|-].*/) != -1 && inCodeBlock === true) {
            finalDetails += "> " + line + "\n";
        }

    }

    if (inCodeBlock === true) {
        finalDetails += "> ```";
    }
    return finalDetails;
}
export function formatSummary(text: string) {
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
    text += "\n";
    let txtArr = text.match(/[\S\s]{1,1800}[\.|\n|\?|\!]/g);

    if (txtArr !== null) {
        return txtArr;
    } else {
        return "Unable to regex message, contact Oracle.";
    }
}
export function generateResMsg(proposal: ProposalObject) {
    let ffResTxt = [];
    if (peerResolutionClasses.indexOf(proposal.kind) >= 0 && peerResolutionClasses.indexOf(proposal.kind) <= 3) {
        // Summary
        let truncSummary = truncateMsg(proposal.summary);
        for (let i = 0; i < truncSummary.length; i++) {
            let summaryFormatted = "";
            if (i === 0) {
                summaryFormatted += "> ### Summary of Resolution\n";
            }
            summaryFormatted += formatSummary(truncSummary[i]!);
            ffResTxt.push(summaryFormatted);
        }
        // Details
        let truncDetails = truncateMsg(proposal.details);
        for (let i = 0; i < truncDetails.length; i++) {
            let detailsFormatted = "";
            if (i === 0) {
                detailsFormatted += "> ### Details of Resolution\n";
            }
            detailsFormatted += formatDetails(truncDetails[i]!);
            ffResTxt.push(detailsFormatted);
        }
    } else if (peerResolutionClasses.indexOf(proposal.kind) >= 6 && peerResolutionClasses.indexOf(proposal.kind) <= 8) {
        let truncDOI = truncateMsg(proposal.details);
        for (let i = 0; i < truncDOI.length; i++) {
            let doiFormatted = "";
            if (i === 0) {
                doiFormatted += "> ### Description of Incident\n";
            }
            doiFormatted += formatSummary(truncDOI[i]!);
            ffResTxt.push(doiFormatted);
        }
        let truncDesire = truncateMsg(proposal.desire);
        for (let i = 0; i < truncDesire.length; i++) {
            let desireFormatted = "";
            if (i === 0) {
                desireFormatted += "> ### Preferential Outcome\n";
            }
            desireFormatted += formatSummary(truncDesire[i]!);
            ffResTxt.push(desireFormatted);
        }
    }
    return ffResTxt;
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
        let stripPrefix = eligiblePeers[i]!.name.substring(4, eligiblePeers[i]!.name.length);
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
        let stripPrefix = eligiblePeers[i]!.name.substring(4, eligiblePeers[i]!.name.length);
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