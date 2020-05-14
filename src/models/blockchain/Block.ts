import * as sha256 from 'js-sha256/src/sha256';

export class Block {
    hash: string;
    previousHash: string;
    data: any;
    timeStamp : Date;
    nonce: number = 0;

		constructor (previousHash: string ,data: any) {
		this.previousHash = previousHash;
		this.data = data;
		this.timeStamp = new Date();
		this.hash = this.calculateHash();

	}

	public calculateHash(): string {
		var hash = sha256.create();
		hash.update('Message to hash');
		hash.hex();

		var calculatedhash = sha256(this.previousHash + this.data.getPublicHash() + this.nonce.toString());	
		return calculatedhash;
	}
	
	
	public  mineBlock(difficulty: number) {

		var target = new Array(difficulty + 1).join("0"); //Create a string with difficulty * "0" 
		while(this.hash.substring( 0, difficulty) != target) {
			this.nonce ++;
			this.hash = this.calculateHash();
		}
		console.log("Block Mined!!! : " + this.hash);
	}


	
	
	
	public getHash() :string {
		return this.hash;
	}

	public setHash(hash: string) {
		this.hash = hash;
	}

	public getPreviousHash(): string {
		return this.previousHash;
	}

	public setPreviousHash(previousHash: string) {
		this.previousHash = previousHash;
	}

	public getData() {
		return this.data;
	}

	public setData(data) {
		this.data = data;
	}

	public getTimeStamp() {
		return this.timeStamp;
	}

	public setTimeStamp(timeStamp: Date) {
		this.timeStamp = timeStamp;
	}

	public getNonce(): number {
		return this.nonce;
	}

	public setNonce(nonce: number) {
		this.nonce = nonce;
	}



}
    