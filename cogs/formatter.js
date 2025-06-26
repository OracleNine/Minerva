const kindtostr = require("../cogs/kindtostr.js");

function formatHeader(kind, subject, author) {
    let resClass= kindtostr.kindToStr(kind);
    let header = `\`\`\`ini
[PEER RESOLUTION] PENDING\n
CLASS: ${resClass}
SUBJECT: ${subject}
AUTHOR: ${author}
\`\`\``
    return header;
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
    truncateMsg
}