import { Component, OnInit } from '@angular/core';
import { faVideo, faVideoSlash, faMicrophone, faMicrophoneSlash, faShareSquare, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import {ActivatedRoute} from "@angular/router";
import { Socket } from "ngx-socket-io";
import { v4 as uuidv4 }  from 'uuid';
import Peer from 'peerjs';

interface VideoElement {
  muted: boolean;
  srcObject: MediaStream;
  userId: string;
  userName: string;
}

@Component({
  selector: 'app-video-room',
  templateUrl: './video-room.component.html',
  styleUrls: ['./video-room.component.css']
})
export class VideoRoomComponent implements OnInit {
  faVideo = faVideo;
  faVideoSlash = faVideoSlash;
  faMicrophone = faMicrophone;
  faMicrophoneSlash = faMicrophoneSlash;
  faShareSquare = faShareSquare;
  faPaperPlane = faPaperPlane;
  icon1 = faMicrophone;
  icon2 = faShareSquare;
  icon3 = faVideo;

  currentUserId:string = uuidv4();
  videos: VideoElement[] = [];
  myVideoStream: any;
  message: any
  roomId: any;
  myPeer: any;
  userName: any;
  messages: {userName: string, message: string, class: string}[] = [];
  peerList: any[] = [];
  currentPeer: any;
  constructor(private route: ActivatedRoute,
              private socket: Socket) { }

  ngOnInit(): void {
    console.log(`Initialize Peer with id ${this.currentUserId}`);
    this.myPeer = new Peer(undefined,{
      path:"/peerjs",
      host:"peer.demo.co-vin.in",
      secure: true,
      config: {
        iceServers: [
          {urls:'stun:stun01.sipphone.com'},
          {urls:'stun:stun.ekiga.net'},
          {urls:'stun:stun.fwdnet.net'},
          {urls:'stun:stun.ideasip.com'},
          {urls:'stun:stun.iptel.org'},
          {urls:'stun:stun.rixtelecom.se'},
          {urls:'stun:stun.schlund.de'},
          {urls:'stun:stun.l.google.com:19302'},
          {urls:'stun:stun1.l.google.com:19302'},
          {urls:'stun:stun2.l.google.com:19302'},
          {urls:'stun:stun3.l.google.com:19302'},
          {urls:'stun:stun4.l.google.com:19302'},
          {urls:'stun:stunserver.org'},
          {urls:'stun:stun.softjoys.com'},
          {urls:'stun:stun.voiparound.com'},
          {urls:'stun:stun.voipbuster.com'},
          {urls:'stun:stun.voipstunt.com'},
          {urls:'stun:stun.voxgratia.org'},
          {urls:'stun:stun.xten.com'},
          {
            urls: 'turn:numb.viagenie.ca',
            credential: 'muazkh',
            username: 'webrtc@live.com'
          },
          {
            urls: 'turn:192.158.29.39:3478?transport=udp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
          },
          {
            urls: 'turn:192.158.29.39:3478?transport=tcp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
          }
        ]
      }
    });

    this.roomId = this.route.snapshot.paramMap.get('roomId');
    this.userName = prompt("Please enter your name");
    let n = <any>navigator;
    let userMedia = (n.mediaDevices.getUserMedia || n.mediaDevices.webkitGetUserMedia || n.mediaDevices.mozGetUserMedia);
    userMedia({
      audio: true,
      video: true,
    }).catch((err: any) => {
      console.error('[Error] Not able to retrieve user media:', err);
      return null;
    }).then((stream: any) => {
      if (stream) {
        this.myVideoStream = stream;
        this.addMyVideo(stream);
      }

      this.myPeer.on('call', (call: any) => {
        console.log('receiving call...', call);
        call.answer(stream);

        call.on('stream', (otherUserVideoStream: MediaStream) => {
          console.log('receiving other stream', otherUserVideoStream);
          let peer: any = call.peer;
          if (!this.peerList.includes(peer)) {
            this.addOtherUserVideo(call.metadata.userId, call.metadata.userName, otherUserVideoStream);
            this.currentPeer = call.peerConnection;
            this.peerList.push(peer)
          }
        });

        call.on('error', (err: any) => {
          console.error(err);
        })
      });

      this.socket.on('user-connected', (userId: any, userName: any) => {
        console.log('Receiving user-connected event', `Calling ${userId}`);

        // Let some time for new peers to be able to answer
        setTimeout(() => {
          const call = this.myPeer.call(userId, stream, {
            metadata: { userId: this.currentUserId, userName: this.userName },
          });
          call.on('stream', (otherUserVideoStream: MediaStream) => {
            console.log('receiving other user stream after his connection');
            let peer: any = call.peer;
            if (!this.peerList.includes(peer)) {
              this.addOtherUserVideo(userId, userName, otherUserVideoStream);
              this.currentPeer = call.peerConnection;
              this.peerList.push(peer)
            }
          });

          call.on('close', () => {
            this.videos = this.videos.filter((video) => video.userId !== userId);
          });
        }, 1000);
      });
    });

    this.myPeer.on('open', (userId: any) => {
      this.socket.emit('join-room', this.roomId, userId, this.userName);
    });

    this.socket.on("createMessage", (msg: any, userId: any, userName: any) => {
      if (this.currentUserId != userId) {
        // let chatMessage = document.getElementById('chatMessage');
        // let remoteMessageDiv = document.createElement('div');
        // remoteMessageDiv.className = 'direct-chat-msg right';
        // let messageDiv = document.createElement('div');
        // messageDiv.className = 'direct-chat-text';
        // messageDiv.innerText = userName + '    '+msg;
        this.messages.push({userName: userName, message: msg, class: 'alt'});
        // remoteMessageDiv.appendChild(messageDiv);
        // chatMessage?.appendChild(remoteMessageDiv);
      }
    })

    this.socket.on('user-disconnected', (userId: any) => {
      console.log(`receiving user-disconnected event from ${userId}`)
      this.videos = this.videos.filter(video => video.userId !== userId);
    });
  }

  addMyVideo(stream: MediaStream) {
    this.videos.push({
      muted: true,
      srcObject: stream,
      userId: this.currentUserId,
      userName: this.userName
    });
  }

  addOtherUserVideo(userId: string, userName: string, stream: MediaStream) {
    const alreadyExisting = this.videos.some(video => video.userId === userId);
    if (alreadyExisting) {
      console.log(this.videos, userId);
      return;
    }
    this.videos.push({
      muted: false,
      srcObject: stream,
      userId,
      userName
    });
  }

  onLoadedMetadata(event: Event) {
    (event.target as HTMLVideoElement).play();
  }

  muteUnmute() {
    const enabled = this.myVideoStream.getAudioTracks()[0].enabled;
    this.icon1 = (this.icon1 == faMicrophone) ? faMicrophoneSlash : faMicrophone;
    if (enabled) {
      this.myVideoStream.getAudioTracks()[0].enabled = false;
    } else {
      this.myVideoStream.getAudioTracks()[0].enabled = true;
    }
  }

  hideVideo() {
    const enabled = this.myVideoStream.getVideoTracks()[0].enabled;
    this.icon3 = (this.icon3 == faVideo) ? faVideoSlash : faVideo;
    if (enabled) {
      this.myVideoStream.getVideoTracks()[0].enabled = false;
    } else {
      this.myVideoStream.getVideoTracks()[0].enabled = true;
    }
  }

  send() {
    if (this.message) {
      this.socket.emit('chat', this.message, this.currentUserId, this.userName, this.roomId);
      // let chatMessage = document.getElementById('chatMessage');
      // let selfMessageDiv = document.createElement('div');
      // selfMessageDiv.className = 'direct-chat-msg';
      // let messageDiv = document.createElement('div');
      // messageDiv.className = 'direct-chat-text';
      // messageDiv.innerText = this.userName + '    '+this.message;
      // selfMessageDiv.appendChild(messageDiv);
      // chatMessage?.appendChild(selfMessageDiv);
      this.messages.push({userName: this.userName, message: this.message, class: ''});
      this.message = "";
    }
  }

  sendMessage(event: KeyboardEvent) {
    if (event.key == 'Enter' && this.message) {
      this.send();
    }
  }

 shareScreen() {
  let n = <any>navigator;
  let displayMedia = (n.mediaDevices.getDisplayMedia || n.mediaDevices.webkitGetDisplayMedia || n.mediaDevices.mozGetDisplayMedia);
  n.mediaDevices.getDisplayMedia({
    video: {
      cursor: 'always'
    },
    audio: {
      echoCancellation: true,
      noiseSupression: true
    }
  }).then((stream: any) => {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.onended = () => {
        this.stopScreenShare();
      };
      const sender = this.currentPeer.getSenders().find((s: any) => s.track.kind === videoTrack.kind);
      sender.replaceTrack(videoTrack);
    }).catch((err: any) => {
      console.log('Unable to get display media ' + err);
    });
  }

  private stopScreenShare() {
    const videoTrack = this.myVideoStream.getVideoTracks()[0];
    const sender = this.currentPeer.getSenders().find((s: any) => s.track.kind === videoTrack.kind);
    sender.replaceTrack(videoTrack);
  }
}
