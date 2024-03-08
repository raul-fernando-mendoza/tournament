import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentAdminWelcomeComponent } from './tournament-admin-welcome.component';

describe('TournamentAdminWelcomeComponent', () => {
  let component: TournamentAdminWelcomeComponent;
  let fixture: ComponentFixture<TournamentAdminWelcomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentAdminWelcomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TournamentAdminWelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
