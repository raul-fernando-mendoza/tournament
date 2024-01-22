import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-medals-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medals-list.component.html',
  styleUrl: './medals-list.component.css'
})
export class MedalsListComponent {
  @Input() tournamentId!:string
}
