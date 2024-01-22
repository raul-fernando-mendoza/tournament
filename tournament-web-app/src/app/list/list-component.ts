import { AfterViewInit, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../firebase.service';

import {MatCardModule} from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { PathService } from '../path.service';
import { TournamentObj } from '../types';
import { AuthService } from '../auth.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BusinesslogicService } from '../businesslogic.service';


interface Link{
  id:string,
  label:string
}

@Component({
  selector: 'list-component',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, RouterModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,    
  ],
  templateUrl: './list-component.html',
  styleUrl: './list-component.css'
})
export class ListComponent implements AfterViewInit{
  @Input() parentCollection!:string 
  @Input() collection!:string
  @Input() onlyOwned:boolean = false  

  form = this.fb.group({
    label:['',Validators.required]
  })  
  submitting = false

  list:Array<Link> = [] 

  
  constructor( private firebaseService:FirebaseService
    ,private pathService:PathService
    ,private authService:AuthService
    ,private fb:FormBuilder
    ,private router: Router
    ,private businesslogicService:BusinesslogicService){
    
  }
  ngAfterViewInit(): void {
      this.update()
  }

  
  update(){
    this.list.length = 0
    this.firebaseService.getDocument( this.parentCollection  ).then( data =>{
      if (data[this.collection]) {
        var listIds:Array<string> = data[this.collection] as Array<string>

        var list = this.list
        listIds.map( id =>{
          var link:Link = {
            id: id,
            label: ''
          }
          list.push( link )
          this.firebaseService.getDocument( this.parentCollection + "/" + this.collection, id).then( data =>{
            if( this.onlyOwned && this.authService.getUserEmail() != data["owner"]){
              for( let i =0; i<list.length; i++){
                if( list[i].id == data["id"]){
                  list.splice( i, 1)
                }
              }              
            }
            else{
              link.label = data["label"]
            }
          })
        })
      }
      else{ //the list is not ordered read directly from subcollection and order by label
        this.firebaseService.getDocuments( this.parentCollection + "/" + this.collection).then( set =>{
          set.map( doc =>{
            let data = doc.data()
            if( this.onlyOwned ){
             if( this.authService.getUserEmail() == data["owner"] ){
              var obj ={
                id:doc.id,
                label:data["label"]
              }
              this.list.push( obj )              
             }
            } 
            else{
              var obj ={
                id:doc.id,
                label:data["label"]
              }
              this.list.push( obj )
            }
          })
          this.list.sort( (a,b)=>{
            if(a["label"] > b["label"])
              return 1
            else return -1
          })
        })
      }
    })    
  }
  encode( url:string ){
    return encodeURIComponent(url)
  }
  /*
  onSubmit(){
    console.log( "adding")
    let id = uuidv4();
    var label = this.form.controls.label.value!
    var obj = {
      label: label
    }
    this.submitting = true
    this.firebaseService.setDocument( this.parentCollection + "/" + this.collection, id, obj).then(data =>{
      console.log("new created" + this.collection)
    }).then( ()=>{
      var objParent:{[key:string]:any} = {}
      var list:Array<string> = []
      this.list.map( e =>{
        list.push(e["id"])
      })
      list.push( id )
      objParent[this.collection] = list
      return this.firebaseService.updateDocumentFromPath( this.parentCollection , objParent)
    }).then( () =>{
      console.log("parent updated:" + this.collection)
      this.router.navigate(["/" + this.collection + "/" + id + "/" + encodeURIComponent(this.parentCollection)])   
    },
    reason =>{
      alert("Error creating:" + this.collection + " " + reason)
      this.isAdding = false
      this.submitting = false
    })
  }
  onNew(){
    this.isAdding = true
  }
  onCancel(){
    this.isAdding = false
  }
 
*/

}
