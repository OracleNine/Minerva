const fs = require('node:fs');
// Each entry in the queue has the folowing properties
// User: ID of the user who submitted the proposal
// Kind: Classification of the proposal which determines the threshold
// Subject: Subject of the proposal
// Summary: Summary of the proposal
// Details: Details of the proposal
// Active: A boolean, whether the proposal is being voted on or not
// Vote-msg: If the proposal is active, this will be the ID of the message that people react to when they vote on the proposal. If the proposal is not active, this will be 0.

// Add an item to the queue
function addToQueue(element) {
    // Fetch the latest version of the queue and store it as an object
    // I hate the fact that so much code is reused but I'll figure out how to simplify this later
    try {
        const queue = fs.readFileSync("./queue.json", "utf8");
	    let qAsObj = JSON.parse(queue);
        qAsObj = qAsObj["queue"];

        // First we will check if the user already has a proposal in the queue
        const result = qAsObj.filter((proposal) => proposal["user"] == element.user);

        if (result.length === 0) {
            console.log("No prior proposals in the queue detected")

            const newQObj = {
                "queue": []
            }

            newQObj["queue"].push(element);

            let qAsStr = JSON.stringify(newQObj);


            try {
                fs.writeFileSync("./queue.json", qAsStr);
            } catch (err) {
                console.error(error);
            }

            return "Your proposal has been successfully added to the queue, and will be voted on in accordance with the Administrative Charter.";

        } else {
            return "You already have an item in the queue. Remove it first with `/remove`.";
        }

    } catch (err) {
        console.error(err);
    }
}
function removeFrmQueue(user) {
    // Need to make sure the queue exists and then store it as an object
    try {
        const queue = fs.readFileSync("./queue.json", "utf8");
	    let qAsObj = JSON.parse(queue);
        let qItems = qAsObj["queue"];

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
    } catch (err) {
        console.error(err);
    }
}
function seeQueue() {
    try {
        const queue = fs.readFileSync("./queue.json", "utf8");
	    let qAsObj = JSON.parse(queue);
        let qItems = qAsObj["queue"];

        return qItems;

    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    addToQueue,
    removeFrmQueue,
    seeQueue
}