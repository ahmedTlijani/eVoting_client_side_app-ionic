import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable()
export class DataSharing {

    private voter_infotmation: any;
    
	constructor(private http: HttpClient) {

	}

    setVoterInformation(info:any)
    {
        this.voter_infotmation = info;
    }
    getVoterInformation()
    {
        return this.voter_infotmation;
    }


}