import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceNewComponent } from './performance-new.component';

describe('PerformanceNewComponent', () => {
  let component: PerformanceNewComponent;
  let fixture: ComponentFixture<PerformanceNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerformanceNewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PerformanceNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
