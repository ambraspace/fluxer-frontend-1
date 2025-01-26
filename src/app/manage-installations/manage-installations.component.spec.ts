import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageInstallationsComponent } from './manage-installations.component';

describe('ManageInstallationsComponent', () => {
  let component: ManageInstallationsComponent;
  let fixture: ComponentFixture<ManageInstallationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageInstallationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageInstallationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
