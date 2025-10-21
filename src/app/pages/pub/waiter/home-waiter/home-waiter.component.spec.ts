import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeWaiterComponent } from './home-waiter.component';

describe('HomeWaiterComponent', () => {
  let component: HomeWaiterComponent;
  let fixture: ComponentFixture<HomeWaiterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeWaiterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeWaiterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
