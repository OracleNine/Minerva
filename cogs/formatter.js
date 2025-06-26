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
    let finalLine = lineBy.length - 1;
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
function truncateMsg(text) {
    // Text display components have a char limit of 4000. To avoid running into errors, this function splits up the message into 4000 char chunks
    // which is returned as an array. The bot can then iterate through that array until all parts of the message have been sent.
    // Probably a better way to do this, but I don't really care.

    let txtArr = text.match(/[\S\s]{1,4000}/g);

    return txtArr;

}

module.exports = {
    formatHeader, 
    truncateMsg,
    formatDetails
}