const kindtostr = require("../cogs/kindtostr.js");
const peerResolutionClasses = ["amd_admin", "amd_rp", "amd_format", "amd_community", "app_member", "app_peer", "inj_rp", "inj_ip", "inj_member"];

function snip(arr, value) {
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
function formatHeader(kind, subject, author, date) {
    let resClass= kindtostr.kindToStr(kind);
    author = author.substring(4, author.length);
    let header = `\`\`\`ini
[PEER RESOLUTION] ${date}\n
    CLASS: ${resClass}
  SUBJECT: ${subject}
   AUTHOR: ${author}
\`\`\``
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
        } else if (line.search(/^[a-zA-Z0-9].+$/) != -1 && inCodeBlock === true) {
            finalDetails += "> ```\n"
            inCodeBlock = false;
            finalDetails += "> `" + line + "`\n";
        } else if (line.search(/^[+|-].*/) != -1 && inCodeBlock === false) {
            finalDetails += "> ```diff\n";
            finalDetails += "> " + line + "\n";
            inCodeBlock = true;
        } else if (line.search(/^[+|-].*/) != -1 && inCodeBlock === true) {
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

    return txtArr;

}
function generateResMsg(proposal) {
    let ffResTxt = [];
    if (peerResolutionClasses.indexOf(proposal.kind) >= 0 && peerResolutionClasses.indexOf(proposal.kind) <= 3) {
        // Summary
        let truncSummary = truncateMsg(proposal.summary);
        for (let i = 0; i < truncSummary.length; i++) {
            let summaryFormatted = "";
            if (i === 0) {
                summaryFormatted += "> ### Summary of Resolution\n";
            }
            summaryFormatted += formatSummary(truncSummary[i])
            ffResTxt.push(summaryFormatted);
        }
        // Details
        let truncDetails = truncateMsg(proposal.details);
        for (let i = 0; i < truncDetails.length; i++) {
            let detailsFormatted = "";
            if (i === 0) {
                detailsFormatted += "> ### Details of Resolution\n";
            }
            detailsFormatted += formatDetails(truncDetails[i])
            ffResTxt.push(detailsFormatted);
        }
    } else if (peerResolutionClasses.indexOf(proposal.kind) >= 6 && peerResolutionClasses.indexOf(proposal.kind) <= 8) {
        let truncDOI = truncateMsg(proposal.details);
        for (let i = 0; i < truncDOI.length; i++) {
            let doiFormatted = "";
            if (i === 0) {
                doiFormatted += "> ### Description of Incident\n";
            }
            doiFormatted += formatSummary(truncDOI[i])
            ffResTxt.push(doiFormatted);
        }
        let truncDesire = truncateMsg(proposal.desire);
        for (let i = 0; i < truncDesire.length; i++) {
            let desireFormatted = "";
            if (i === 0) {
                desireFormatted += "> ### Preferential Outcome\n";
            }
            desireFormatted += formatSummary(truncDesire[i])
            ffResTxt.push(desireFormatted);
        }
    }
    return ffResTxt;
}
function sortVoters(a,b) {
    if (a.name < b.name) {
        return -1;
    } else if (a.name > b.name) {
        return 1;
    } else {
        return 0;
    }
}
function formatTally(eligiblePeers, currentDate) {
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
        let stripPrefix = eligiblePeers[i].name.substring(4, eligiblePeers[i].name.length);
        tallyBody += kindtostr.determineVoterState(eligiblePeers[i].voter_state) + ` \`` + stripPrefix + `\`\n`;
        if (eligiblePeers[i].voter_state === 1) {
            votedYes++;
        } else if (eligiblePeers[i].voter_state === 2) {
            votedNo++;
        } else if (eligiblePeers[i].voter_state === 3) {
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
function finalTally(eligiblePeers, currentDate, threshold) {
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
        let stripPrefix = eligiblePeers[i].name.substring(4, eligiblePeers[i].name.length);
        tallyBody += kindtostr.determineVoterState(eligiblePeers[i].voter_state) + ` \`` + stripPrefix + `\`\n`;
        if (eligiblePeers[i].voter_state === 1) {
            votedYes++;
        } else if (eligiblePeers[i].voter_state === 2) {
            votedNo++;
        } else if (eligiblePeers[i].voter_state === 3) {
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
}