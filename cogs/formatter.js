const kindtostr = require("../cogs/kindtostr.js");

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
function formatSummary(text) {
    let finalSummary = "";
    let lineBy = text.split("\n");

    for (let i = 0; i < lineBy.length; i++) {
        let line = lineBy[i];
        if (line != "") {
            finalSummary += "> " + line + "\n";
        }
    }

    console.log(finalSummary);
    return finalSummary;

}
function truncateMsg(text) {

    // Text display components have a char limit of 4000. To avoid running into errors, this function splits up the message into 4000 char chunks
    // which is returned as an array. The bot can then iterate through that array until all parts of the message have been sent.

    text += "\n";
    // Note to self, the message HAS to end with a \n, otherwise it will not get truncated properly due to how the regex is parsed.
    // Yes, it's stupid but this is the easiest solution that I can think of.

    let txtArr = text.match(/[\S\s]{1,2000}\n/g);

    return txtArr;

}

module.exports = {
    formatHeader, 
    truncateMsg,
    formatDetails,
    formatSummary
}