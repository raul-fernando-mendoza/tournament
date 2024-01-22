import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedalsListComponent } from './medals-list.component';

describe('MedalsListComponent', () => {
  let component: MedalsListComponent;
  let fixture: ComponentFixture<MedalsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedalsListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MedalsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
