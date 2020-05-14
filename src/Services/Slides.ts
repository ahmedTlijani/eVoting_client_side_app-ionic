import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable()
export class Slides {

    slides_set = [{ 
        title: "e-Voting mobile application",
        image:'./assets/images/votez.jpg',
        description:"Mobile application based on blockchain technologie"
        },
        {
          title: "Face-recognition ",
          image:'./assets/images/facerecognition.png',
          description:"Face-recognitino module to insure maximum security"
        },
        {
          title: "Vote & track voting results",
          image:'./assets/images/charts.png',
          description:"You can vote to one parti and see the results live."
        },
        {
          title: "Connect with",
          image:'./assets/images/login.png',
          description:"You can sign in with your cin number and birth-date "
        }];




	constructor() {}

    getSlide()
    {
        return this.slides_set;
    }


}
