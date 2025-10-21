import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckUserStatusComponent } from './check-user-status.component';

describe('CheckUserStatusComponent', () => {
  let component: CheckUserStatusComponent;
  let fixture: ComponentFixture<CheckUserStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckUserStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckUserStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
