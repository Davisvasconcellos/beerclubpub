import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventLinksModalComponent } from './event-links-modal.component';

describe('EventLinksModalComponent', () => {
  let component: EventLinksModalComponent;
  let fixture: ComponentFixture<EventLinksModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventLinksModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventLinksModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
