const kindtostr = require("../cogs/kindtostr.js");
const peerResolutionClasses = ["amd_admin", "amd_rp", "amd_format", "amd_community", "app_member", "app_peer", "inj_rp", "inj_ip", "inj_member"];

function formatHeader(kind, subject, author, date) {
    let resClass= kindtostr.kindToStr(kind);
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
function formatSummary(text, title) {
    let finalSummary = "";
    let lineBy = text.split("\n");

    finalSummary += "> ### " + title + "\n";

    for (let i = 0; i < lineBy.length; i++) {
        let line = lineBy[i];
        if (line != "") {
            finalSummary += "> " + line + "\n";
        }
    }

    return finalSummary;

}  
function truncateMsg(text) {

    // Text display components have a char limit of 4000. To avoid running into errors, this function splits up the message into 4000 char chunks
    // which is returned as an array. The bot can then iterate through that array until all parts of the message have been sent.

    text += "\n";

    let txtArr = text.match(/[\S\s]{1,1800}[\.|\n|\?|\!]/g);

    return txtArr;

}
function generateResMsg(proposal) {
    let ffResTxt = [];
    if (peerResolutionClasses.indexOf(proposal.kind) >= 0 && peerResolutionClasses.indexOf(proposal.kind) <= 3) {
        // Summary
        let formatted = formatSummary(proposal.summary, "Summary of Resolution")
        let truncSummary = truncateMsg(formatted);
        for (let i = 0; i < truncSummary.length; i++) {
            ffResTxt.push(truncSummary[i]);
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
        
    }

    return ffResTxt;
}

module.exports = {
    formatHeader, 
    truncateMsg,
    formatDetails,
    generateResMsg
}