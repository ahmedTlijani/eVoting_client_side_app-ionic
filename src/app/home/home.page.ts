import { Component, ViewChild, HostListener } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Slides } from 'src/Services/Slides';
import { Router } from '@angular/router';
import { PeopleModel } from 'src/models/PeopleModel';
import { SpringAPiService } from 'src/Services/SpringAPiService';
import { p2pService } from 'src/Services/p2pService';
import { ChainData } from 'src/models/blockchain/ChainData';
import { DataSharing } from 'src/Services/DataSharing';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  // https://ionicframework.com/docs/api/slides
  // More options http://idangero.us/swiper/demos/

  slides: IonSlides;

  @ViewChild(IonSlides) set slidesvc(slides) {
    this.slides = slides;
  };
  
  cin_error = '' ; // error message cin ,, lenght > 8 and only numbers
  birth_date_error=''; 
  user_cin: any = '';
  user_birth_ate: any = null;

  temp_image = './assets/images/09987673.jpg';

  voter_data = {
    personne: null,
    image_captured: "image"
  }


  slides_set = [];

  slideOpts = { initialSlide: 0, speed: 400, pagination: { el: '.swiper-pagination', dynamicBullets: false, }, };

  expand_form:boolean = false;
  slide_ended:boolean = false;
  end_turn:boolean = false;
  is_loading = false; // showing the loading screen
  err_message='';

  testFlat = false;


  // camera plugin 
  //https://ionicframework.com/docs/native/camera
  //npm install @ionic-native/camera@beta not like in the official documentation

  camera_options: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE
  }

  constructor(private voterService: SpringAPiService,private p2p: p2pService,private datasharing: DataSharing, private camera: Camera, private s : Slides, private route: Router) {
    this.slides_set = s.getSlide();
  }

  @HostListener("click", ["$event"])
  
  ionViewDidEnter() {
   // this.slide_ended = true;
   // this.openForm(); // testing only
  }


 goNext()
 {
  this.slides.slideNext().then(()=>{
    console.log("slided to next");
  })
 }
 skip()
 {
   // go to filan slide 
   this.slides.length().then(
    (last)=>
    {
      console.log("sildes length",last);
      this.slides.slideTo(last).then(()=>
      {
        "console.log(done)"
      })
    }
  )  
 }
 showDiv() // if the slide reach the end show the div - 
 {
   console.log('last slide');
  this.slide_ended = true;
 }
 hideDiv() // if the slide didnt reach the end hide the div - 
 {
   console.log('not last slide');
  this.slide_ended = false;
 }

 
 openForm()
 {
   if(!this.expand_form && !this.end_turn)
   {
    console.log('open form');
    this.expand_form = true;
    this.end_turn = true; // dont allow to open form again
   }
   console.log(this.expand_form);
 }
 closeForm(event: any)
 {
  if(this.expand_form && this.end_turn)
  {
    event.stopPropagation();
   console.log('close form');
   this.expand_form = false;
   this.end_turn = false;
  }
 }

 login()
 {
  //cordova_not_available / working - tested 
  console.log("login..");
  this.err_message='';

  if(this.user_cin.length!=8)
   {
     this.cin_error = 'Cin must be 8 numbers'
     return;
   }
  if(!this.user_birth_ate)
   {
     this.birth_date_error = 'You need to chose your birth data'
     return;
   }
  this.cin_error = ''
  this.birth_date_error = ''

  console.log("user", this.user_cin, this.user_birth_ate);
   
  this.is_loading = true;
  let peopple : PeopleModel = new PeopleModel;
  peopple.cin = this.user_cin;
  peopple.date_naissance = this.user_birth_ate;
  console.log("personne", peopple);
  this.voterService.getOneElecteurByCinData(peopple).subscribe(
    data => {
      console.log("data", data);

      if(data)//
      {
        if(data.status) // existe 
        {
          // set voter data 
          this.voter_data.personne = data.data;
          // check if the user didnt vote already 
          // create new peer 
          this.p2p._ini_(); // open peer to peer connexion
          setTimeout(()=>{
            var temp_block = new ChainData();
            temp_block.setchainBlocks(this.p2p.chain.getchainBlocks());
            console.log("temp block from login",temp_block);
            //console.log('one ', temp_block.getchainBlocks()[0].data.publicHash);
            var verif = false;
            for(var i=0;i<temp_block.getchainBlocks().length;i++)
            {
              if(temp_block.getchainBlocks()[i].data.publicHash == data.data.hash_code)
              {
                verif = true; // voted
                break;
              }
            }
            if(verif)
            {
              console.log("you already voted");
              this.err_message = "You already voted on this poll";
              this.is_loading = false;
              //alert("You already voted on this poll");
              // open result page 
              setTimeout(()=>{
                this.route.navigate(["results"]);
              },1000);
            }
            else
            {
              console.log("you can vote");
              // open camera - native cordova camera doen't work on browser 
              this.camera.getPicture(this.camera_options).then((imageData) => {
                this.is_loading = false;
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
                                  this.datasharing.setVoterInformation(this.voter_data.personne);// set electeur 
                                  // naviagte to this.route.navigate(["page-voter"]);
                                  this.route.navigate(["page-voter"])
                                  this.is_loading = false;
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
                                  self.datasharing.setVoterInformation(self.voter_data.personne);// set electeur 
                                  // naviagte to this.route.navigate(["page-voter"]);
                                  self.route.navigate(["page-voter"])
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
               
            }
          },2000);
          
        }
        else
        { // date de naissance et incorrect
          this.is_loading = false;
          console.log("Veuillez verifier votre date de naissance");
          this.err_message = "Veuillez verifier votre date de naissance!";
        }
           
      }
      else
      {
        this.is_loading = false;
        console.log("Vous n'êtes pas inscrit");
        this.err_message = "Vous n'êtes pas inscrit!";
      }   
      

    },
    err => {
      console.log("err",err);
      this.err_message='Connexion Error';
      this.is_loading = false;
    }
  )
 }


 testFlatButton()
 {
   this.testFlat=true;
 }


 checkCin()
 {
   //console.log(this.user_cin);
   !this.user_cin.match(/^[-+]?[0-9]+$/) ? this.cin_error="Cin must be only numbers" : this.cin_error="";
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



}



/// try runing on real device 
/*
* run nox first 
* ionic cordova run android --prod
*/