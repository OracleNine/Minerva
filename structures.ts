export interface VoterObject {
    id: string;
    name: string;
    voter_state: number;
}
export class ProposalObject {
    user: string;
    submitted: number;
    kind: string;
    active: boolean;
    votemsg: string;
    startdate: number;
    enddate: number;
    eligiblevoters: VoterObject[];
    subject: string;
    summary: string;
    details: string;
    desire: string;
}
