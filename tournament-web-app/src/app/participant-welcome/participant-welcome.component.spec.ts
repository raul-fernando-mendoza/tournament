import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantWelcomeComponent } from './participant-welcome.component';

describe('ParticipantWelcomeComponent', () => {
  let component: ParticipantWelcomeComponent;
  let fixture: ComponentFixture<ParticipantWelcomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticipantWelcomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParticipantWelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
