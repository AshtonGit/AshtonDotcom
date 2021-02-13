import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudAnimatedBgComponent } from './cloud-animated-bg.component';

describe('CloudAnimatedBgComponent', () => {
  let component: CloudAnimatedBgComponent;
  let fixture: ComponentFixture<CloudAnimatedBgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloudAnimatedBgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CloudAnimatedBgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
