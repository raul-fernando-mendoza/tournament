import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomeJurorComponent } from './welcome-juror.component';

describe('WelcomeJurorComponent', () => {
  let component: WelcomeJurorComponent;
  let fixture: ComponentFixture<WelcomeJurorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomeJurorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WelcomeJurorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
