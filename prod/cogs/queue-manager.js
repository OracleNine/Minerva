"use strict";
const fs = require('node:fs');
// Each entry in the queue has the folowing properties
// User: ID of the user who submitted the proposal
// Kind: Classification of the proposal which determines the threshold
// Subject: Subject of the proposal
// Summary: Summary of the proposal
// Details: Details of the proposal
// Active: A boolean, whether the proposal is being voted on or not
// Vote-msg: If the proposal is active, this will be the ID of the message that people react to when they vote on the proposal. If the proposal is not active, this will be 0.
// Eligiblevoters: An array of objects, each of which represent a Peer at the time the resolution is created
function fetchQueue() {
    try {
        const queue = fs.readFileSync("./queue.json", "utf8");
        let qAsObj = JSON.parse(queue);
        return qAsObj;
    }
    catch (err) {
        console.error(err);
    }
}
// Add an item to the queue
function addToQueue(element) {
    // Fetch the latest version of the queue and store it as an object
    let qAsObj = fetchQueue();
    let qItems = qAsObj["queue"];
    qItems.push(element);
    // Update the queue object
    qAsObj["queue"] = qItems;
    // Convert to string and then write to the json file
    let qAsStr = JSON.stringify(qAsObj);
    try {
        fs.writeFileSync("./queue.json", qAsStr);
    }
    catch (err) {
        console.error(error);
    }
    return "Your proposal has been successfully added to the queue. You can see all items in the queue with `/queue view`.";
}
function removeFrmQueue(user) {
    // Need to make sure the queue exists and then store it as an object
    let qAsObj = fetchQueue();
    let qItems = qAsObj["queue"];
    const isActive = qItems.filter((proposal) => proposal["user"] == user);
    if (isActive.length > 0) {
        if (isActive[0].active === true) {
            return "You cannot remove an active item from the queue.";
        }
        else {
            const result = qItems.filter((proposal) => proposal["user"] != user);
            const newQObj = {
                "queue": result
            };
            let qAsStr = JSON.stringify(newQObj);
            try {
                fs.writeFileSync("./queue.json", qAsStr);
            }
            catch (err) {
                console.error(err);
            }
            return "Your proposal has been removed.";
        }
    }
    else {
        return "You have no proposals in the queue.";
    }
}
function findActive() {
    let qAsObj = fetchQueue();
    let qItems = qAsObj["queue"];
    const result = qItems.filter((proposal) => proposal["active"] == true);
    if (result.length > 0) {
        return result;
    }
    else {
        return false;
    }
}
function sortQueueByDate(a, b) {
    return a.submitted - b.submitted;
}
function findNextProposal() {
    let qAsObj = fetchQueue();
    let qItems = qAsObj["queue"];
    let sortedQItems = qItems.sort(sortQueueByDate);
    return sortedQItems[0];
}
function changeProperty(user, property, value) {
    let qAsObj = fetchQueue();
    let qItems = qAsObj["queue"];
    let targetItem = qItems.filter((proposal) => proposal["user"] === user);
    let without = qItems.filter((proposal) => proposal["user"] !== user); // Every item in the queue except our target
    if (targetItem.length > 0) {
        let itemToChange = targetItem[0];
        try {
            itemToChange[property] = value;
            without.push(itemToChange);
            const newQObj = {
                "queue": without
            };
            let qAsStr = JSON.stringify(newQObj);
            fs.writeFileSync("./queue.json", qAsStr);
        }
        catch (err) {
            console.error(err);
        }
    }
}
module.exports = {
    addToQueue,
    removeFrmQueue,
    fetchQueue,
    findActive,
    findNextProposal,
    changeProperty
};
//# sourceMappingURL=queue-manager.js.map