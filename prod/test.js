"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let text = `
He has affected to render the Military independent of and superior to the Civil power.

He has combined with others to subject us to a jurisdiction foreign to our constitution, and unacknowledged by our laws; giving his Assent to their Acts of pretended Legislation:

For Quartering large bodies of armed troops among us:

For protecting them, by a mock Trial, from punishment for any Murders which they should commit on the Inhabitants of these States:

For cutting off our Trade with all parts of the world:

For imposing Taxes on us without our Consent:

For depriving us in many cases, of the benefits of Trial by Jury:

For transporting us beyond Seas to be tried for pretended offences:

For abolishing the free System of English Laws in a neighbouring Province, establishing therein an Arbitrary government, and enlarging its Boundaries so as to render it at once an example and fit instrument for introducing the same absolute rule into these Colonies:

For taking away our Charters, abolishing our most valuable Laws, and altering fundamentally the Forms of our Governments:

For suspending our own Legislatures, and declaring themselves invested with power to legislate for us in all cases whatsoever.

He has abdicated Government here, by declaring us out of his Protection and waging War against us.

He has plundered our seas, ravaged our Coasts, burnt our towns, and destroyed the lives of our people.

He is at this time transporting large Armies of foreign Mercenaries to compleat the works of death, desolation and tyranny, already begun with circumstances of Cruelty & perfidy scarcely paralleled in the most barbarous ages, and totally unworthy the Head of a civilized nation.

He has constrained our fellow Citizens taken Captive on the high Seas to bear Arms against their Country, to become the executioners of their friends and Brethren, or to fall themselves by their Hands.

He has excited domestic insurrections amongst us, and has endeavoured to bring on the inhabitants of our frontiers, the merciless Indian Savages, whose known rule of warfare, is an undistinguished destruction of all ages, sexes and conditions.

In every stage of these Oppressions We have Petitioned for Redress in the most humble terms: Our repeated Petitions have been answered only by repeated injury. A Prince, whose character is thus marked by every act which may define a Tyrant, is unfit to be the ruler of a free people.

Nor have We been wanting in attentions to our Brittish brethren. We have warned them from time to time of attempts by their legislature to extend an unwarrantable jurisdiction over us. We have reminded them of the circumstances of our emigration and settlement here. We have appealed to their native justice and magnanimity, and we have conjured them by the ties of our common kindred to disavow these usurpations, which, would inevitably interrupt our connections and correspondence. They too have been deaf to the voice of justice and of consanguinity. We must, therefore, acquiesce in the necessity, which denounces our Separation, and hold them, as we hold the rest of mankind, Enemies in War, in Peace Friends.

We, therefore, the Representatives of the united States of America, in General Congress, Assembled, appealing to the Supreme Judge of the world for the rectitude of our intentions, do, in the Name, and by Authority of the good People of these Colonies, solemnly publish and declare, That these United Colonies are, and of Right ought to be Free and Independent States; that they are Absolved from all Allegiance to the British Crown, and that all political connection between them and the State of Great Britain, is and ought to be totally dissolved; and that as Free and Independent States, they have full Power to levy War, conclude Peace, contract Alliances, establish Commerce, and to do all other Acts and Things which Independent States may of right do. And for the support of this Declaration, with a firm reliance on the protection of divine Providence, we mutually pledge to each other our Lives, our Fortunes and our sacred Honor.
`;
while (text.matchAll(/^[+-][^\r\n]{1000,}/gmd).next().value !== undefined) {
    let runOnResult = text.matchAll(/^[+-][^\r\n]{1000,}/gmd).next().value;
    let runOnCoordinates = runOnResult.indices[0];
    let runOn = text.substring(runOnCoordinates[0], runOnCoordinates[1]);
    let toFirstPunctuation = runOn.matchAll(/^[+-].{0,1000}[\.|\?|\!]/gmd);
    if (toFirstPunctuation === null) {
        toFirstPunctuation = runOn.matchAll(/^[+-].{0,1000}/gmd);
    }
    let toPunctuationEndCoord = toFirstPunctuation.next().value.indices[0][1];
    let plusOrMinus = "\n";
    if (runOn.match(/^[+]/g) !== null) {
        plusOrMinus += "+";
    }
    else {
        plusOrMinus += "-";
    }
    text = text.slice(0, runOnCoordinates[0] + toPunctuationEndCoord) + plusOrMinus + text.slice(runOnCoordinates[0] + toPunctuationEndCoord);
}
function lastIndexOfRegex(expression, target) {
    let lastIndex = -1;
    for (const match of target.matchAll(expression)) {
        lastIndex = match.index;
    }
    return lastIndex;
}
let returnChunks = [];
while (text.length > 1800) {
    let toCharLimit = text.substring(0, 1800);
    let chunkEnd = toCharLimit.lastIndexOf("\n");
    if (chunkEnd <= 0) {
        chunkEnd = lastIndexOfRegex(/\.|\!|\?/gm, toCharLimit);
        if (chunkEnd <= 0) {
            chunkEnd = lastIndexOfRegex(/\s/gm, toCharLimit);
            if (chunkEnd <= 0) {
                chunkEnd = 1800;
            }
        }
    }
    let newChunk = text.substring(0, chunkEnd);
    returnChunks.push(newChunk);
    text = text.slice(chunkEnd);
}
returnChunks.push(text);
console.log(returnChunks);
//# sourceMappingURL=test.js.map