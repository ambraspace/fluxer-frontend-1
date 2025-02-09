import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTriggersComponent } from './manage-triggers.component';

describe('ManageTriggersComponent', () => {
  let component: ManageTriggersComponent;
  let fixture: ComponentFixture<ManageTriggersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageTriggersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageTriggersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
