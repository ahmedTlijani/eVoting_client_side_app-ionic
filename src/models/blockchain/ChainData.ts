import { BlockData } from './BlockData';
import { Block } from './block';


export class ChainData {
    private blockchain: any = [];
    private difficulty: number = 3;


	constructor(){}

    public createGenesisBlocks(){
        var p = new BlockData(null,null);
	    var  genesis = new Block("0",p); // hash / data		
		this.blockchain.push(genesis);// base block
    }

    public getchainBlocks()
    {
        return this.blockchain;
    }
	public setchainBlocks(blockchain){
		this.blockchain = blockchain;
	}

	public getDifficulty(): number 
	{
		return this.difficulty;
	}
	
    public isChainValid():Boolean {

		var currentBlock; 
        var previousBlock;

        var hashTarget = new Array(this.difficulty + 1).join("0"); //Create a string with difficulty * "0" 

		//loop through blockchain to check hashes:
		for(var i=1; i < this.blockchain.length; i++) {
			currentBlock = this.blockchain[i];
			previousBlock = this.blockchain[i-1];
			
			//compare previous hash and registered previous hash
			if(previousBlock.getHash() != currentBlock.getPreviousHash()) {
				console.log("Previous Hashes not equal");
				return false;
			}
			
			//compare previous hash and registered previous hash
			if(previousBlock.getHash() != currentBlock.getPreviousHash())  {
				console.log("Previous Hashes not equal");
				return false;
			}
			//check if hash is solved
			if( currentBlock.getHash().substring( 0, this.difficulty) != hashTarget ) {
				console.log("This block hasn't been mined");
				return false;
			}
			
			
		}
		return true;
	}

	
	public addBlock(block: Block)
	{
		//block.setPreviousHash(this.blockchain[this.blockchain.length-1].getHash());
		this.blockchain.push(block);
	}
	
	public createBlock(electeur_hash: any,parti_id: any):Block // creating block with electeur and to who he voted 
	{
		var p = new BlockData(parti_id,electeur_hash); // votedTo ,voter public hash
		var block = new Block(this.blockchain[this.blockchain.length-1].hash,p);
		return block;
	}
    


}