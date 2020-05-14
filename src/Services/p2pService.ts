import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { of } from 'rxjs';
import { map, catchError, tap ,delay } from 'rxjs/operators';
import { ChainData } from '../models/blockchain/ChainData';

declare var Peer: any;

@Injectable()
export class p2pService {

  private baseurlblockchain = 'http://localhost:8085/api/blockchain/';
  private getIp = "https://api6.ipify.org/?format=json";
  peer: any;  
  myPeerId: any;

  connectedPeers = [];
  chain: ChainData = new ChainData();

  data_chain = {
    type: null, // block or blockchain
    data: null // block or blockchain
  }

  constructor(private myRoute: Router, private http: HttpClient) { 
    //console.log("difference function: ",this.extractNewPeers([6,9,8,1,0],[6,9,7,2,1]));
  }
  

  public _ini_()
  {
    this.createPeer();
    var self = this; // same work as the arrow functions 
    // make peer listen to sent data from oather peers
    this.peer.on('connection', function(conn) { // change this to arrow function - damn it astaghfer allah 
      conn.on('data', function(data){
        
      // play with data here // data_chain = { type: null, // block or blockchain data: null // block or blockchain }
      var myData = JSON.parse(data)
      console.log(myData);

      if(data && myData.type=="blockchain") // the sender sent the whole blockchain
      {
        console.log("-----------");
        // compare the old blockchain with the new 
        if(self.chain.getchainBlocks().length < myData.data.blockchain.length)
        {
          // take the new blockchain
          console.log("saving the new blockchain")
          self.chain.setchainBlocks(myData.data.blockchain); // setting the received blockchain to te current chain
        }else
        {
          console.log("something is wrong");
        }
        console.log("Chain Blocks is: ",self.chain.getchainBlocks());
        return;
      }
      else(data && myData.type=="block") // the sender sent only one block
      {
        // adding the block to our blockchain
        console.log("block added");
        self.chain.addBlock(myData.data);
        console.log("Chain Blocks is: ",self.chain.getchainBlocks());
      }
        
      });
    });
    this.runChecknewPeers();
  }


  destroyPeer()
  {
    // check if peer list is empty , if u the only peer send the blockchain to server 
    this.getConnectedPeers().subscribe(
      data => {

        var list_1 = data;

         //console.log("------------ Lsit --------------");
         for (var i=0; i<list_1.length; i++) {
           if (list_1[i] === this.myPeerId) {
             list_1.splice(i, 1);
               break;       //<-- Uncomment  if only the first term has to be removed
           }
         }

         console.log("list peers before destroying",list_1);
          // check if there are peers connected , if not send data to server to be saved
          if(list_1.length==0)
          {
            console.log("sending data to server before destroying peer"); // sending the whole blockcahin to server 
            console.log("blockcahin",this.chain);
            this.setBlockToServer(this.chain.getchainBlocks()).subscribe(
              data=>{
                if(data) // always true
                {
                  console.log("Blockchain pushed to server before destroying peer");
                }
              },
              err=>{
                console.log("err setting blocckhain to server before destroying peer", err);
                return false;
              }
            );
          }else{
            console.log("there is peer? before destroying")
          }

          this.peer.destroy();
          return true;
    });
 
  }

  // create connected peer
  // with ip adresse https://api6.ipify.org/?format=json
  public createPeer()
  {
    //var id_ = this.makeid(15)//Math.floor((Math.random() * 9999) + 999);
    //this.peer = new Peer(id_); //{key: 'xxxYOURKEYGOESHERExxxx'}
    
    this.getIpAdresse().subscribe(
      data => {
        //console.log(data);
        var ip_: string = "";
        ip_ = data;//data.ip;
        this.myPeerId = this.cryptIp(ip_);
        //console.log(ip_);

        this.peer = new Peer(this.cryptIp(ip_));
        console.log("id: ", this.peer.id);
        this.addPeer(this.peer.id).subscribe(
          data => {
            //console.log(data);
            if(data)
            {
              //console.log("peer added");
            }else 
            {
              //console.log("peer exist");
            }

            this.getConnectedPeers().subscribe(
             data => {
              console.log("------ connected peers ------")
               console.log(data);
               this.setConnectedPeers(data);

               // get the blockchain from server if peers list is empty
               var list_1 = this.connectedPeers;

                //console.log("------------ Lsit --------------");
                for (var i=0; i<list_1.length; i++) {
                  if (list_1[i] === this.myPeerId) {
                    list_1.splice(i, 1);
                      break;       //<-- Uncomment  if only the first term has to be removed
                  }
                }
                console.log(list_1);
                // if peers list is empty 
               if(list_1.length==0)
               {
                this.getBlockchainFromServer().subscribe(
                  data=> {
                  console.log("blockchain from server", data);
                  this.chain.setchainBlocks(data);
                  // check if the blockchain is empty -- for testing purposes
                  if(this.chain.getchainBlocks().length==0)
                  {
                    // create the genesis block and start mining
                    console.log("creating genesis block");
                    this.chain.createGenesisBlocks();
                  }
                  
                  },
                  err=>{
                    console.log("err getting blockchain from server", err);
                  }
                )
               } 
               else{
                 console.log("get blockcahin from peers")
               }

             },
             err => {
               console.log("err", err);
             }
           );
          },
          err =>{
            console.log(err);
          }
        );
      },
      err => {
        console.log(err);
      }
    ) 
  }


  // function to get the blockchain from server if there is not connected peers 
  // if thre connected peers it will receive the blockchain from other peers 
  getBlockchainFromServer(): Observable<any>
  {
    return(this.http.get(this.baseurlblockchain+"get-blockchain"));
  }

  setBlockToServer(blockchain: any): Observable<any>
  {
    return(this.http.post(this.baseurlblockchain+"set-blockchain", blockchain));
  } 


  cryptIp(ip_)
  {
    var str = ip_;
    str = str.replace(".","-");
    str = str.replace(".","-");
    str = str.replace(".","-");
    //console.log(str);
    return str;
  }
  decrypt(ip_)
  {
    var str = ip_;
    str = str.replace("-",".");
    str = str.replace("-",".");
    str = str.replace("-",".");
    //console.log(str);
    return str;
  }

  // we will define local adresse in the mobile app to user it 
  getIpAdresse(): Observable<any>
  {
    //return this.http.get(this.getIp); // lets work with local ip adresse predfined for testing
    let local_ip = '265.21.2.0';
    if(local_ip)
    return of(local_ip); // ip adresse saved on localsotrage
    else { alert("no ip found"); return;} ;
  }

  // function to add the peer id to server - log 
  //"/{peer_id}/create"

  public addPeer(peer_id:any)
  {
    //this.connectedPeers.push(this.decrypt(peer_id));
    return(this.http.get(this.baseurlblockchain+ peer_id + "/create"));
  }

   //("/delete/{id}"
  public deletePeer()
  {
    return(this.http.delete(this.baseurlblockchain+ "/delete/"+ this.myPeerId));
  }
  // get all connected peers in the network
  getConnectedPeers():Observable<any>
  { 
    return (this.http.get(this.baseurlblockchain+'get-all-peers'));
    //return(this.connectedPeers);
  }

  setConnectedPeers(data:any)
  { 
    this.connectedPeers = [];
    for(let i=0;i<data.length;i++)
    {
      this.connectedPeers.push(data[i].peer_id);
    }  
    //console.log("Connected peers", this.connectedPeers);
  }

  // sending data to all connected peers
  sendingData(message)
  {
    //console.log("------ connected peers ------")
    this.getConnectedPeers().subscribe(
      data => {
        console.log(data);
        this.setConnectedPeers(data);

        var list = this.connectedPeers;

        //console.log("------------ Lsit --------------");
        for (var i=0; i<list.length; i++) {
          if (list[i] === this.myPeerId) {
              list.splice(i, 1);
              break;       //<-- Uncomment  if only the first term has to be removed
          }
        }

        // check if there are peers connected , if not send data to server to be saved
        if(list.length==0)
        {
          console.log("sending data to server"); // sending the whole blockcahin to server 
          console.log("blockcahin",this.chain);
          this.setBlockToServer(this.chain.getchainBlocks()).subscribe(
            data=>{
              if(data) // always true
              {
                console.log("Blockchain pushed to server");
              }
            },
            err=>{
              console.log("err setting blocckhain to server", err);
            }
          );
          return;
        }
        console.log("sending to peers...")

        console.log(list);
        for(var j=0;j<list.length; j++)
        {
          console.log("connecting to", list[j]);
          this.sendToId(list[j],message);
        }
      },
      err => {
        console.log("err", err);
      }
    );
  }

  // send blockchain or just a block
  // object { type="block" or "blockchain", data = block or the blockchain } 
  sendToId(id, message)
  {
    var conn  = this.peer.connect(id);
    // on open will be launch when you successfully connect to PeerServer
    conn.on('open', ()=> {
      // here you have conn.id
      let a = message;
      conn.send(a);
    });
  }

  // check if there are new peers - if there send to them the blockchain 

  runChecknewPeers()
  {
    setTimeout(() => {
      this.checkPeersList();
      this.runChecknewPeers();
    }, 2000);
  }

  checkPeersList()
  {
    this.getConnectedPeers().subscribe(
      data => {
        
         var extracted_peers = this.extractData(data);
         var new_peers = this.extractNewPeers( this.connectedPeers,extracted_peers);
         //console.log(new_peers)

         var list_1 = new_peers;
            //console.log("------------ Lsit --------------");
            for (var i=0; i<list_1.length; i++) {
              if (list_1[i] === this.myPeerId) {
                list_1.splice(i, 1);
                break;       //<-- Uncomment  if only the first term has to be removed
              }
            }

          if(list_1.length!=0)
          {
            console.log("----------------------------------")
            console.log(this.connectedPeers);
            console.log(extracted_peers);
   
            console.log("there is new peer");
            console.log("new Peers", new_peers);
            // send the blockchain to new peers 
            this.data_chain.type="blockchain";
            this.data_chain.data=this.chain;
            var myJSON = JSON.stringify(this.data_chain);

            for(var i=0;i<list_1.length;i++)
              {
                console.log('sending the blockchain to: '+list_1[i]);
                this.sendToId(list_1[i], myJSON);
              }
            this.setConnectedPeers(data);
          }
          else
          {
          //console.log(this.connectedPeers);
          //console.log("there is not new peer"); 
          }
      
      },
      err => {
        console.log("Error checking peers list", err);
      }
    )
  }

extractNewPeers(previous_array, new_array)
{
	var array1 = previous_array;
	var array2 = new_array;

	var tempArr = array2.filter(function(item) {
	  	return !array1.includes(item); 
		});
		array1 = array1.filter(function(item) {
		  return !array2.includes(item); 
		});
		array2 = tempArr;

	//console.log(array1);
	//console.log(array2);
	return array2;
}

extractData(data)
{
 var p = [];
  for(let i=0;i<data.length;i++)
  {
   p.push(data[i].peer_id);
  } 
  return p;
}
  // generate and id
  makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }


}