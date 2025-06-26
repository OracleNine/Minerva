const fs = require('node:fs');
const dayjs = require('dayjs')
let relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);
// Each entry in the queue has the folowing properties
// User: ID of the user who submitted the proposal
// Kind: Classification of the proposal which determines the threshold
// Subject: Subject of the proposal
// Summary: Summary of the proposal
// Details: Details of the proposal
// Active: A boolean, whether the proposal is being voted on or not
// Vote-msg: If the proposal is active, this will be the ID of the message that people react to when they vote on the proposal. If the proposal is not active, this will be 0.

function fetchQueue() {
    try {
        const queue = fs.readFileSync("./queue.json", "utf8");
	    let qAsObj = JSON.parse(queue);

        return qAsObj;

    } catch (err) {
        console.error(err);
    }
}
// Add an item to the queue
function addToQueue(element) {
    // Fetch the latest version of the queue and store it as an object
    let qAsObj = fetchQueue();
    let qItems = qAsObj["queue"]


    qItems.push(element);

    // Update the queue object

    qAsObj["queue"] = qItems;

    // Convert to string and then write to the json file

    let qAsStr = JSON.stringify(qAsObj);

    try {
        fs.writeFileSync("./queue.json", qAsStr);
    } catch (err) {
        console.error(error);
    }

    return "Your proposal has been successfully added to the queue. You can see all items in the queue with `/showqueue`.";
}
function removeFrmQueue(user) {
    // Need to make sure the queue exists and then store it as an object
    let qAsObj = fetchQueue();
    let qItems = qAsObj["queue"]

    // Find and filter out the proposal submitted by the user
    const result = qItems.filter((proposal) => proposal["user"] != user);

    const newQObj = {
        "queue": result
    }
    let qAsStr = JSON.stringify(newQObj);

    try {
        fs.writeFileSync("./queue.json", qAsStr);
    } catch (err) {
        console.error(err);
    }
}
function findActive() {
    let qAsObj = fetchQueue();
    let qItems = qAsObj["queue"];

    const result = qItems.filter((proposal) => proposal["active"] == true);

    if (result.length > 0) {
        return true;
    } else {
        return false;
    }
}
function findNextProposal() {
    let qAsObj = fetchQueue();
    let qItems = qAsObj["queue"];
    let dateArr = [];
    for (let i = 0; i < qItems.length; i++) {
        let item = qItems[i];
        dateArr.push(item["submitted"]);
    }

    let comparison = dayjs(dateArr[0]).toNow(true);
    console.log(comparison);
}

module.exports = {
    addToQueue,
    removeFrmQueue,
    fetchQueue,
    findActive,
    findNextProposal
}