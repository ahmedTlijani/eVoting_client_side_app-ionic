import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import {Http, HttpModule } from '@angular/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { Slides } from 'src/Services/Slides';
import { Camera} from '@ionic-native/camera/ngx';
import { DataSharing } from 'src/Services/DataSharing';
import { SpringAPiService } from 'src/Services/SpringAPiService';
import { p2pService } from 'src/Services/p2pService';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    HttpModule,
    HttpClientModule],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Slides,
    Camera,
    DataSharing,
    SpringAPiService,
    p2pService,
    
   ],
  bootstrap: [AppComponent]
})
export class AppModule {}
