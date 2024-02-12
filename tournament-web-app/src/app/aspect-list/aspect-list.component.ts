import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Evaluation, TournamentCollection, TournamentObj } from '../types';

@Component({
  selector: 'app-aspect-list',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule      
    ,RouterModule],
  templateUrl: './aspect-list.component.html',
  styleUrl: './aspect-list.component.css',

})
export class AspectListComponent{
  @Input() tournamentId!:string
  @Input() tournament!:TournamentObj
  @Input() evaluationId!:string 
  @Input() evaluation!:Evaluation

  constructor( 
    private router:Router
  ){

  }

  onAspect(id:string){
    this.router.navigate(['/',TournamentCollection.collectionName,this.tournamentId,'evaluation',this.evaluationId,'aspect',id])
  }

}
