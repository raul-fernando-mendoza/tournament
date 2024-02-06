import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FirebaseService } from '../firebase.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Category, Tournament, TournamentCollection, TournamentObj } from '../types';
import { v4 as uuidv4, v4 } from 'uuid';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule      
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,MatInputModule
    ,RouterModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css',

})
export class CategoryListComponent {
  tournamentId:string | null = null
  tournament!:TournamentObj

  isAdding = false

  constructor( public firebaseService:FirebaseService 
    ,private fb:FormBuilder
    ,private activatedRoute: ActivatedRoute    
  ){
    var thiz = this
    this.activatedRoute.paramMap.subscribe({
        next(paramMap){
          thiz.tournamentId = null
          if( paramMap.get('tournamentId')!=null ){
            thiz.tournamentId = paramMap.get('tournamentId')
            thiz.update()
          }
        }
      })
  }

  form = new FormGroup({
    categories: new FormArray([]),
  });  

  getCategoryGroups(): FormGroup[] {
    let formArray:FormArray  = this.form.get('categories') as FormArray
    let formGroups:FormGroup[] = (formArray.controls) as FormGroup[]
    return formGroups
  }

  update(){
    this.firebaseService.getDocument( TournamentCollection.collectionName, this.tournamentId).then( (data)=>{
      this.tournament = data 
      let FA = this.form.get('categories') as FormArray
      FA.clear()
      if( FA ){
        this.tournament.categories?.map( category =>
          FA.push(
            this.fb.group({
              id:[category.id],
              label:[category.label,Validators.required]
            })
          )
        )
      }      
    },
    reason =>{
      alert("Error updating medals")
    })    
  }

  add() {
    let category = this.form.get('categories') as FormArray
    if( category ){
      category.push(
        this.fb.group({
          id:[null],
          label:['',Validators.required]
        })
      );
      this.isAdding = true
    }
  }
  onSubmit(){
    let categoryFGs = this.getCategoryGroups()
    let categoryGrp = categoryFGs[ categoryFGs.length -1 ]
    let id = categoryGrp?.controls["id"].value
    let label = categoryGrp?.controls["label"].value
    let category:Category = { 
      id:uuidv4(),
      label: label,
      description: ''
    }
    this.tournament.categories.push( category )
    let obj:Tournament = {
      categories:this.tournament.categories
    }        
   
    this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
      console.log("medals list updated")
      this.isAdding = false
      this.update()
    },
    reason =>{
      alert("Error updating medals")
    })    
  }

  onSave(id:string) {
    console.log("on save")
    if( id ){

      let FGs = this.getCategoryGroups()
      let idx = FGs.findIndex( FG => FG.controls["id"].value == id )
      if( idx >= 0 ){
        let categoryGrp = FGs[idx]
        let label =  categoryGrp?.controls["label"].value.trim()

        this.tournament.categories[ idx ].label = label
        let obj:Tournament = {
          categories:this.tournament.categories
        }        
       
        this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
          console.log("medals list updated")
          this.update()
        },
        reason =>{
          alert("Error updating medals")
        })
      }
    }
  }

  onDelete(id:string) {

    let idx:number = this.tournament.categories.findIndex( c => c.id == id)

    if( idx >= 0){
      this.tournament.categories.splice(idx,1)
      let obj:Tournament = {
        categories:[] = this.tournament.categories
      }
  
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("categories list updated")
        this.update()
      },
      reason =>{
        alert("Error updating categories")
      })
    }
  }
  onCancelAdd(){
    let FGs = this.getCategoryGroups()
    FGs.splice( FGs.length-1,1)
    this.isAdding =false
  }  

  onLeave($event:any, id:string){
    console.log( "onleave" )
    /* 
    var resultado = window.confirm('Desea Guardar los cambios?');
    if (resultado === true) {
        this.onSave(id)
    } 
    else{
      this.isAdding = false
      this.update()     
    }
    */
    return true
  }  

  onChange( id:string ){
    let FGs = this.getCategoryGroups()
    FGs.map( fg =>{
      if( fg.controls["id"].value != id){
        fg.disable()
      } 
    })
    return true
  }

  onCancelEdit(){
    this.update()
  }

}
