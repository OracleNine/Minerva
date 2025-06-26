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
function formatDetails() {

}

module.exports = {
    formatHeader, 
    formatDetails
}