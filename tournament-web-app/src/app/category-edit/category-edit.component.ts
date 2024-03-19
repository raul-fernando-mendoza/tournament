import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { FirebaseService } from '../firebase.service';
import { Category, Tournament, TournamentCollection, TournamentObj } from '../types';

@Component({
  selector: 'app-category-edit',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule      
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,MatInputModule
    ,RouterModule
    ,MatCardModule
    ,QuillModule        
  ],
  templateUrl: './category-edit.component.html',
  styleUrl: './category-edit.component.css'
})
export class CategoryEditComponent {
  tournamentId!:string
  categoryId!:string

  tournament:TournamentObj | null = null
  category:Category | null = null 

  form = this.fb.group({
    label:["",Validators.required],
    description:[""]
  })  
  
  constructor( public firebaseService:FirebaseService 
    ,private fb:FormBuilder
    ,private activatedRoute: ActivatedRoute     
    ,private router:Router
  ){
    var thiz = this
    this.activatedRoute.paramMap.subscribe({
        next(paramMap){
          let tournamentId = paramMap.get('tournamentId')
          let categoryId = paramMap.get('categoryId')
          if( tournamentId!=null && categoryId ){
            thiz.tournamentId = tournamentId
            thiz.categoryId = categoryId
            thiz.update()
          }
        }
      })
  }
  update(){
    this.firebaseService.getDocument( TournamentCollection.collectionName, this.tournamentId).then( (data)=>{
      
      this.tournament = data as TournamentObj
      
      let category = this.tournament.categories.find( e => e.id == this.categoryId)
      if( category ){
        this.category = category
        this.form.controls.label.setValue( category.label )
        this.form.controls.description.setValue( category.description )
      }
    },
    reason =>{
      alert("Error leyendo categoria")
    })    
  }

  onSubmit(){
    let label = this.form.controls.label.value
    let description = this.form.controls.description.value
    if( this.tournament && this.category && label ){
      this.category.label = label
      this.category.description = description ? description : ""
      let obj:Tournament = {
        categories:this.tournament.categories
      }        
     
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("categoria ha sido modificada")
        this.router.navigate(['../../'], { relativeTo: this.activatedRoute })

      },
      reason =>{
        alert("Error modificando categoria")
      })       
    }
    
  }
  onDelete(){
    if( !confirm("Esta seguro de querer borrar:" +  this.category!.label) ){
      return
    }          
    let index = this.tournament!.categories.findIndex( e => e.id == this.categoryId)
    if( index >= 0 ){
      this.tournament!.categories.splice( index, 1)
      let obj:Tournament = {
        categories:this.tournament!.categories
      }        
     
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("categoria ha sido modificada")
        this.router.navigate(['../../'], { relativeTo: this.activatedRoute })

      },
      reason =>{
        alert("Error modificando categoria")
      })       
    }    

  }
}
