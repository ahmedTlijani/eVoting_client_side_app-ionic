export class BlockData{
    voted_to: number;
    publicHash: string;


	constructor(voted_to: number,publicHash: string) {
		this.publicHash = publicHash;
		this.voted_to = voted_to;
	}
	
	public getVoted_to(): number {
		return this.voted_to;
	}
	public setVoted_to(voted_to: number) {
		this.voted_to = voted_to;
	}
	public  getPublicHash(): string {
		return this.publicHash;
	}
	public setPublicHash(publicHash: string) {
		this.publicHash = publicHash;
    } 
    

}
