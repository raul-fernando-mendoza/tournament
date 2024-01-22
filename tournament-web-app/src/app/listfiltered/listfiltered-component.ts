import { AfterViewInit, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../firebase.service';

import {MatCardModule} from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { PathService } from '../path.service';
import { Filter, TournamentObj } from '../types';
import { AuthService } from '../auth.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BusinesslogicService } from '../businesslogic.service';


interface Link{
  id:string,
  obj:any
}



@Component({
  selector: 'list-component-filtered',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, RouterModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,    
  ],
  templateUrl: './listfiltered-component.html',
  styleUrl: './listfiltered-component.css'
})
export class ListFilteredComponent implements AfterViewInit{
  @Input() parentCollection!:string 
  @Input() collection!:string
  @Input() filters:Array<Filter>|null = null  

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
    let tempMap = new Map<string, any>();

    this.firebaseService.getDocument( this.parentCollection  ).then( data =>{
      this.firebaseService.getDocuments( this.parentCollection + "/" + this.collection, this.filters).then( set =>{
        set.map( doc =>{
          let l:Link = {
            id:doc.id,
            obj:doc.data()
          } 
          tempMap.set(doc.id, l)
        })
      })
      .then( () =>{
        if (!data[this.collection]) { //the list is indexed? then read them in order
          tempMap.forEach( e =>{
            this.list.push( e)
          })
          this.list.sort( (a,b) =>{
            return ( a.obj.label > b.obj.label ) ? 1:-1
          })
        }
        else{
          var listIds:Array<string> = data[this.collection]
          listIds.map( id =>{
            let obj = tempMap.get( id )
            if( obj ){
              this.list.push( obj )
            }
          })          
        }
      })
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
