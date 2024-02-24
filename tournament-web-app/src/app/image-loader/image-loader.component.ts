import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { storage } from '../../environments/environment';
import {  ref ,  uploadBytesResumable, getDownloadURL, deleteObject} from "firebase/storage";
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule} from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-image-loader',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule     
    ,MatInputModule
    ,MatCardModule
  ],  
  templateUrl: './image-loader.component.html',
  styleUrls: ['./image-loader.component.css']

})
export class ImageLoaderComponent implements AfterViewInit{
  @Input() basepath!:string //the folder where the file should be written
  @Input() fullpath:string | null = null//current full path to the storage
  
  @Input() maxSize = 200 * 1024*1024 
  @Output() onload = new EventEmitter<string>();
  @Output() ondelete = new EventEmitter<string>(); 

  progress:string = ""
  error:string  = ""
  url:string = ""

  constructor() { 
    console.log("creaing file-loader")

  }
  ngAfterViewInit(): void {
    console.log("after view iniit file loader")
    if( this.fullpath ){
      var storageRef = ref(storage, this.fullpath )
      getDownloadURL(storageRef).then((downloadURL) => {
        this.url = downloadURL
      })
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
        if( error.code == 'storage/unknown'){
          thiz.error = "Error desconocido"
        }
      }, 
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log('File available at', downloadURL);
          this.url = downloadURL
          thiz.progress = "Complete"
          this.onload.emit(this.fullpath!)          
        });
      }
    );
  }   

  removePropertyValue(){

    if( this.fullpath ){
      var storageRef = ref(storage, this.fullpath )
      
      deleteObject(storageRef).then( () =>{
        this.ondelete.emit(this.fullpath!)
        this.fullpath = null
        this.url = ""
      })
      .catch( (reason: string) => {
        console.log("file was not deleted:" + reason)      
      })
    }
  }
}
