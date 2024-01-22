import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../firebase.service';
import { CategoryObj, TournamentCollection, CategoryCollection } from '../types'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ListComponent } from '../list/list-component';
import { PathService } from '../path.service';
import { AuthService } from '../auth.service';
import { BusinesslogicService } from '../businesslogic.service';

@Component({
  selector: 'app-tournament-category-component',
  standalone: true,
  imports: [
   CommonModule, 
   MatCardModule, 
   RouterModule,
   FormsModule,
   ReactiveFormsModule,
   MatFormFieldModule,
   MatInputModule,
   MatIconModule,
   MatButtonModule,
   ListComponent
],
  templateUrl: './category-component.html',
  styleUrl: './category-component.css'
})
export class CategoryComponent implements OnInit{
  id:string | null = null
  tournamentId!:string 

  collection:string = CategoryCollection.collectionName
  submitting = false

  form = this.fb.group({
    label:['',Validators.required]
  })

  isAdmin:boolean=false
  category:CategoryObj| null = null
  
  constructor( public firebaseService:FirebaseService 
    ,private fb:FormBuilder
    ,private activatedRoute: ActivatedRoute
    ,private router: Router
    ,public pathService: PathService
    ,public authService:AuthService
    ,private bussinesslogicService:BusinesslogicService 
    ){
      var thiz = this
      this.activatedRoute.paramMap.subscribe({
          next(paramMap){
            thiz.id = null
            if( paramMap.get('tournamentId')!=null ){
              var str : string | null = paramMap.get('tournamentId')
              if ( str != null){
                thiz.tournamentId = decodeURIComponent(str)              
              }
            }    
            if( paramMap.get('id')!=null ){
              thiz.id = paramMap.get('id')
              thiz.update()
            }
          }
        })
  }
  ngOnInit(): void {
    this.bussinesslogicService.getIsAdmin(TournamentCollection.collectionName + "/" + this.tournamentId).then( isAdmin=>{
      this.isAdmin = isAdmin
    })  
  }
  update(){
    if ( this.id != null){
      this.firebaseService.getDocument(
        TournamentCollection.collectionName + "/"+ this.tournamentId + "/" + this.collection,
        this.id).then( data =>{
        this.category = data as CategoryObj
        this.form.controls.label.setValue( this.category.label)
      })        
    }
  }

  onCancel(){
    this.router.navigate(['/' + TournamentCollection.collectionName + "/"+ this.tournamentId])
  }
  onSubmit(){
    console.log( "adding")
    let id = uuidv4();
    var label = this.form.controls.label.value!
    var obj:CategoryObj = {
      label: label
    }
    this.submitting = true
    this.firebaseService.setDocument( TournamentCollection.collectionName + "/"+ this.tournamentId + "/" + this.collection, id, obj).then(data =>{
      console.log("category added")
    },
    reason=>{
      console.log("ERROR adding category:" + reason)
    })
    .then( () =>{
      return this.firebaseService.unionArrayElementDoc( TournamentCollection.collectionName + "/"+ this.tournamentId, this.collection, id).then( ()=>{
        console.log("aspect category to parent")
      },
      reason=>{
        alert("ERROR adding category to parent:"+reason)
      })
    })
    .then( ()=>{
      this.router.navigate(["/" + TournamentCollection.collectionName + "/"+ this.tournamentId + "/"+ this.collection + "/" + id ])

    })    
  }

  onDelete( ){
    if( !confirm("Esta seguro de querer borrar:" +  this.category!.label) ){
      return
    }        
    this.firebaseService.removeArrayElementDoc(  TournamentCollection.collectionName + "/"+ this.tournamentId , CategoryCollection.collectionName, this.id!).then( ()=>{
      console.log("the item has been removed from the parent")
      },
      reason=>{
        alert("ERROR: removng from parent:" + this.collection + " " + reason)
    }).then( ()=>{
      return this.firebaseService.deleteDocument( TournamentCollection.collectionName + "/"+ this.tournamentId + "/" + this.collection , this.id! ).then( ()=>{
        console.log( "category removed")
        
      },
      reason =>{
        alert("ERROR removing:" + this.collection + " " + reason)
      })
    }).then( ()=>{
      console.log("end")
      this.router.navigate([this.pathService.getPreviousPath( TournamentCollection.collectionName + "/"+ this.tournamentId)])
    },
    reason=>{
      alert("Error onDelete:" + reason)
    })
  }
  onChange($event:any, attribute:string){
    if( this.id ){
      this.firebaseService.onChange($event, TournamentCollection.collectionName + "/"+ this.tournamentId + "/" + this.collection ,this.id,attribute).then( ()=>{
        console.log("onchange completed")
        this.update() 
      })
    }
  }
}
