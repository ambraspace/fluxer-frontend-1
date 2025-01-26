import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallationsTablesComponent } from './installations-tables.component';

describe('InstallationsTablesComponent', () => {
  let component: InstallationsTablesComponent;
  let fixture: ComponentFixture<InstallationsTablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstallationsTablesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstallationsTablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
