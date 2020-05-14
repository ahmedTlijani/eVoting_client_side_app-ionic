import { Component, OnInit } from '@angular/core';
import { p2pService } from 'src/Services/p2pService';
import { Router } from '@angular/router';
import { SpringAPiService } from 'src/Services/SpringAPiService';
import { ChainData } from 'src/models/blockchain/ChainData';
import { NavController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss'],
})
export class ResultsPage implements OnInit {

  parties_stat = [];
  parties_list = [];
  total_eleteur:any =0;
  is_loading: boolean = false;
  err_message = '';

  // countdown 
  deadline = 'November 14 2019 00:00:00 GMT+0200';
  days: any = '00';
  hours: any = '00';
  minutes: any = '00';
  seconds: any = '00';

  constructor(private springApi: SpringAPiService,private p2p:p2pService, private route: Router,public navCtrl: NavController,public platform: Platform) { }

  ngOnInit() {
    this.setDate();
    this.getParties();
  }

  
  getParties()
  {
    this.is_loading = true;
    this.springApi.getAllParti().subscribe(
      data => {
        this.parties_list = data;
        console.log(data);
        //this.isLoading = false;
        for(var i=0;i<data.length;i++)
        {
          var temp = { id: data[i].parti_id,name:data[i].name , percentage:0 , qte:0 , image:data[i].image}
          this.parties_stat.push(temp);
        }
        console.log("parties stat", this.parties_stat);
        
        this.analysechain();


      },
      err => {
        this.is_loading = false;
        console.log("error", err);
      }
    )
  }

  analysechain()
  {
    var temp_block = new ChainData();
    temp_block.setchainBlocks(this.p2p.chain.getchainBlocks());
    this.total_eleteur = temp_block.getchainBlocks().length -1;
    if(this.total_eleteur<0)this.total_eleteur = 0;
    console.log("temp block from login",temp_block);
    setTimeout(()=>{
      for(var i=0;i<this.parties_stat.length;i++)
      {
        for(var j=0;j<temp_block.getchainBlocks().length;j++)
        {
          if((this.parties_stat[i].id == temp_block.getchainBlocks()[j].data.voted_to) && temp_block.getchainBlocks()[j].data.publicHash)
          {
            this.parties_stat[i].qte +=1;
          }
        }
      }
      console.log("parties stat after analysing", this.parties_stat)

      // set the percentage
      for(var j=0;j<this.parties_stat.length;j++)
      {
        if(this.total_eleteur==0)
        {
          this.parties_stat[j].percentage = 0;
        }
        else
        {
        var per = this.parties_stat[j].qte / this.total_eleteur * 100;
        this.parties_stat[j].percentage = per;
        }
      }
      this.is_loading = false;
    },2000);

  }

  setDate()
  {
    setTimeout(()=>{
      let a = this.getTimeRemaining(this.deadline);
      //console.log(a.total);
      this.days = a.days;
      this.hours = a.hours;
      this.minutes = a.minutes;
      this.seconds = a.seconds;
      this.setDate();
    },1000)
  }

  getTimeRemaining(endtime: string){
    let d = new Date();
    var t = Date.parse(endtime) - Date.parse(d.toString());
    //console.log(t);
    var seconds = this.n( Math.floor( (t/1000) % 60 ) );
    var minutes = this.n( Math.floor( (t/1000/60) % 60 ) );
    var hours = this.n( Math.floor( (t/(1000*60*60)) % 24 ) );
    var days = this.n( Math.floor( t/(1000*60*60*24) ) );
    return {
        'total': t,
        'days': days,
        'hours': hours,
        'minutes': minutes,
        'seconds': seconds
    };
}


n(n){ return n > 9 ? "" + n: "0" + n; }



  logout()
  {
    console.log("Logout");
    this.p2p.deletePeer().subscribe(
      data=> {
        if(data)
        {
          console.log("deleted")
          this.p2p.destroyPeer();
          setTimeout(()=>{
            this.route.navigate(["home"]);
          },1000);
        }
        else
        {
          console.log("not exist");
        }
      },
      err => {
        console.log("deleting peer error ", err);
      }
      )
  }
 
}
