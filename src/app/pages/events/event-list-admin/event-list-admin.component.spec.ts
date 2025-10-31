import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventListAdminComponent } from './event-list-admin.component';

describe('EventListAdminComponent', () => {
  let component: EventListAdminComponent;
  let fixture: ComponentFixture<EventListAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventListAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventListAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
