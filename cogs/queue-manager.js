const fs = require('node:fs');

// Get the queue and load it as an Object
try {
	const queue = fs.readFileSync("./queue.json", "utf8");
	let qAsObj = JSON.parse(queue);

    // Each entry in the queue has the folowing properties
    // User: ID of the user who submitted the proposal
    // Threshold: Threshold of the proposal
    // Subject: Subject of the proposal
    // Summary: Summary of the proposal
    // Details: Details of the proposal
    // Active: A boolean, whether the proposal is being voted on or not
    // Vote-msg: If the proposal is active, this will be the ID of the message that people react to when they vote on the proposal. If the proposal is not active, this will be 0.

    // Add an item to the queue
    function addToQueue(user, threshold, subject, summary, details) {
        const propAsObj = {};

        propAsObj.user = user;
        propAsObj.threshold = threshold;
        propAsObj.subject = subject;
        propAsObj.summary = summary;
        propAsObj.details = details;

        qAsObj["queue"].push(propAsObj);

        console.log(qAsObj);

    }
} catch (err) {
	console.error(err);
}

module.exports = {
    addToQueue
}