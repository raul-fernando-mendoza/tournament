import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Observer } from 'rxjs';
import { storage } from '../../environments/environment';
import { getStorage, ref ,  uploadBytesResumable, getDownloadURL, StorageObserver, UploadTaskSnapshot, StorageError, deleteObject} from "firebase/storage";
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';

export interface FileLoadedEvent{
  property:string
  fileFullPath:string
}

@Component({
  selector: 'app-file-loader',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule     
    ,MatInputModule
  ],  
  templateUrl: './file-loader.component.html',
  styleUrls: ['./file-loader.component.css']

})
export class FileLoaderComponent implements AfterViewInit{
  @Input() basepath!:string //the folder where the file should be written
  @Input() label:string = ""  //displayName
  @Input() property!:string //this is just an id sent by the requestor and is returned as part of the event not used internally
  @Input() filename!:string //optional if present this will be the name used instead of label
  
  @Input() maxSize = 200 * 1024*1024 
  @Output() onload = new EventEmitter<FileLoadedEvent>();
  @Output() ondelete = new EventEmitter<FileLoadedEvent>();

  fullpath:string | undefined 
  progress:string = ""
  error:string  = ""

  @ViewChild('status', {static: true}) statusElement!: ElementRef;
  @ViewChild('fileName', {static: true}) inputFileElement!: ElementRef;
 
  constructor() { 
    console.log("creaing file-loader")

  }
  ngAfterViewInit(): void {
    console.log("after view iniit file loader")
    if( this.filename ){
      this.label = this.filename.split("/").reverse()[0] 
    } 
  }

  selectFile(event:any) {

    
    var selectedFiles = event.target.files;
   
    var file:File = selectedFiles[0]

    if( file.size > 4000 * 1024*1024) {
      alert( "El archivo es muy grande")
      return
    }

    this.fullpath = this.basepath + "/"+ file.name.replace(" ","_")

    this.label = this.fullpath.split("/").reverse()[0] 

    var storageRef = ref(storage, this.fullpath )

    const metadata = {
      contentType: 'image/jpeg'
    };

    var uploadTask = uploadBytesResumable(storageRef, file, metadata);
    var thiz = this
    uploadTask.on('state_changed',
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        console.log(snapshot.bytesTransferred + " of " + snapshot.totalBytes); // progress of upload
        thiz.progress = snapshot.bytesTransferred + " of " + snapshot.totalBytes

        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
        }
     
      }, 
      (error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            thiz.error = "usuario no tiene permiso para subir el archivo"
            break;
          case 'storage/canceled':
            // User canceled the upload
            thiz.error = "El usuario cancelo la carge"
            break;
    
          // ...
    
          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            thiz.error = "Error desconocido"
            break;
        }
      }, 
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log('File available at', downloadURL);
          thiz.progress = "Complete"
          thiz.inputFileElement.nativeElement.innerText = this.fullpath!.split("/").reverse()[0]
          var event:FileLoadedEvent={
            property:this.property,
            fileFullPath:downloadURL
          }
          this.onload.emit(event)          
        });
      }
    );
  }   

  removePropertyValue(){

    var storageRef = ref(storage, this.fullpath )
    
    deleteObject(storageRef).then( () =>{
      var event:FileLoadedEvent={
        property:this.property,
        fileFullPath:storageRef.fullPath
      }      
      this.ondelete.emit(event)
      this.fullpath = undefined
      this.inputFileElement.nativeElement.innerText = this.label
    })
    .catch( (reason: string) => {
      console.log("file was not deleted:" + reason)      
    })
  }

  getFileName(){
    if( this.fullpath ){
      return this.fullpath.split("/").reverse()[0] 
    }
    else return this.label
  }
    
}
