import { AppRoutingModule } from './app-routing.module';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {SocketIoModule} from "ngx-socket-io";
import { HomeComponent } from './home/home.component';
import { RoomComponent } from './room/room.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { VideoRoomComponent } from './video-room/video-room.component';
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RoomComponent,
    VideoRoomComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SocketIoModule.forRoot({
      url: 'https://peer.demo.co-vin.in'
    }),
    NgbModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
