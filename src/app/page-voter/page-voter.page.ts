import { Component, OnInit } from '@angular/core';
import { DataSharing } from 'src/Services/DataSharing';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { p2pService } from 'src/Services/p2pService';
import { ChainData } from 'src/models/blockchain/ChainData';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { SpringAPiService } from 'src/Services/SpringAPiService';

@Component({
  selector: 'app-page-voter',
  templateUrl: './page-voter.page.html',
  styleUrls: ['./page-voter.page.scss'],
})
export class PageVoterPage implements OnInit {

  voter_information:any;
  parti_set : any = [];
  chosen_parti:any = null;
  is_loading = false; // showing the loading screen
  err_message = '';

  temp_image = './assets/images/09987673.jpg';

  
  // blochcain issues

  data_chain = {
    type: null, // block or blockchain
    data: null // block or blockchain
  }

  voter_data = {
    personne: null,
    image_captured: "image"
  }

  camera_options: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE
  }



  constructor(private p2p: p2pService,private voterService: SpringAPiService,private route: Router,public camera: Camera, public alertController: AlertController,private sharing: DataSharing) {
    this.chosen_parti = null;
    
    // testing 
    var a = [
      {name:'Parti 1'},
      {name:'Parti 2'},
      {name:'Parti 3'},
      {name:'Parti 4'},
      {name:'Parti 5'},
      {name:'Parti 6'},
    ];
    //this.parti_set = a ;
    

   }

  ngOnInit() {
    console.log("hello from page voter");
    this.getList();
    this.voter_information = this.sharing.getVoterInformation();
    if(!this.voter_information) {console.log("voter information didnt set yet?");}
    else { 
      this.voter_data.personne = this.voter_information;
      console.log(this.voter_information);
    }
  }


  chose_this(element)
  {
    this.chosen_parti = element;
  }


  voter()
  {
    if(this.chosen_parti==null)
    {
      this.presentAlert("You need to vote to someoene!");
      return;
    }else
    {
      this.presentAlertConfirm("You sure you want to vote to "+this.chosen_parti.name);
    }
    console.log("you have chosen", this.chosen_parti );
  }

  async presentAlertConfirm(message) {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Okay',
          handler: () => {
            console.log('Confirm Okay');
            console.log("Voting to", this.chosen_parti );
            // add the block here after verifying another time the face 
              // open camera - native cordova camera doen't work on browser 
              this.is_loading = true;
              var self = this;
              this.camera.getPicture(this.camera_options).then((imageData) => {
                this.err_message='Camera Works';
                console.log("camera works");
                let base64Image = imageData ; //'data:image/jpeg;base64,' + imageData;
                //alert(base64Image);
                //console.log('base64 image',base64Image);
                this.voter_data.image_captured = base64Image;
                // call the face recognition module here 
                  this.voterService.verifierFace(this.voter_data).subscribe(
                        data => { // true
                                console.log(data); 
                                if(data.status=="OK") //the two faces are equal
                                { 
                                  console.log("Exact match");
                                  this.err_message ="Exact match";
                                  // naviagte to this.route.navigate(["page-voter"]);
                                  this.is_loading = false;
                                  this.voter_block();

                                }
                                else if(data.status=="FAIL") //The two faces are different
                                {
                                  console.log("Incomplete match");
                                  this.err_message = "Wrong face detected";
                                  this.is_loading = false;
                                } 
                                else if(data.status==0) // I was't able to locate...
                                {
                                  console.log("No face detected! try again with a better position.");
                                  this.err_message = "No face detected! try again with a better position.";
                                  this.is_loading = false;
                                }

                                }, 
                        err => {
                                console.log('HTTP Error',err);
                                this.err_message = "Face verification not available";
                                this.is_loading = false;
                                }) // end verifyFace

               }, (err) => {
                 console.log("error",err);
                 this.err_message= err;
                 // lets user a simple image to try the verificatin with it 
                 console.log("base64 image testing sample");
                 let self = this;
                 this.toDataURL(this.temp_image, function(dataUrl) {
                   let base64image = dataUrl.slice(23);
                   //console.log('RESULT:', base64image);
                   self.voter_data.image_captured = base64image;

                  // call the face recognition module here 
                  self.voterService.verifierFace(self.voter_data).subscribe(
                        data => { // true
                                console.log(data); 
                                if(data.status=="OK") //the two faces are equal
                                { 
                                  console.log("Exact match");
                                  self.err_message ="Exact match";
                                  // naviagte to this.route.navigate(["page-voter"]);
                                  self.voter_block();
                                  self.is_loading = false;
                                }
                                else if(data.status=="FAIL") //The two faces are different
                                {
                                  console.log("Incomplete match");
                                  self.err_message = "Wrong face detected";
                                  self.is_loading = false;
                                } 
                                else if(data.status==0) // I was't able to locate...
                                {
                                  console.log("No face detected! try again with a better position.");
                                  self.err_message = "No face detected! try again with a better position.";
                                  self.is_loading = false;
                                }

                                }, 
                        err => {
                                console.log('HTTP Error',err);
                                self.err_message = "Face verification not available";
                                self.is_loading = false;
                                }) // end verifyFace


                 })
                
                // Handle error
               });          
            // camera component end here 

          }
        }
      ]
    });

    await alert.present();
  }



  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Warning',
      subHeader: '',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

 // image to base64
 toDataURL(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = function() {
      callback(reader.result);
    }
    reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
  }

  voter_block()
  {
      // creating the block 
    console.log(this.voter_data.personne);
    console.log(this.chosen_parti.parti_id);
    var temp_block = new ChainData();
    temp_block.setchainBlocks(this.p2p.chain.getchainBlocks());
    console.log("blockchain from panel", temp_block);

    var block = temp_block.createBlock(this.voter_data.personne.hash_code, this.chosen_parti.parti_id); // electeur hash code and id parti
    block.mineBlock(temp_block.getDifficulty());
    
    temp_block.addBlock(block);

    this.p2p.chain.setchainBlocks(temp_block.getchainBlocks());

    console.log("voting for...");
    this.data_chain.type= "block";
    this.data_chain.data= block;
    var message = this.data_chain;
    console.log(message);
    var myJSON = JSON.stringify(message);

    this.p2p.sendingData(myJSON); 
    setTimeout(()=>{
      this.route.navigate(["results"]);
    },1000);
  }


  logout()
  {
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


  getList()
  {  
    this.is_loading = true;
    this.voterService.getAllParti().subscribe(
      data => {
          console.log(data);
          this.is_loading = false;
          this.parti_set = data ;
       }, 
       err => {
        this.is_loading = false;
        this.err_message ="Can't load partis list";
        console.log('HTTP Error',err);
       },
       () => console.log('HTTP request completed.')
    )  
}



}
