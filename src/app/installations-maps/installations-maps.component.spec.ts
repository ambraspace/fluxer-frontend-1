import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallationsMapsComponent } from './installations-maps.component';

describe('InstallationsMapsComponent', () => {
  let component: InstallationsMapsComponent;
  let fixture: ComponentFixture<InstallationsMapsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstallationsMapsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstallationsMapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
