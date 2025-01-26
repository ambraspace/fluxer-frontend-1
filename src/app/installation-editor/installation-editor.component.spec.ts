import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallationEditorComponent } from './installation-editor.component';

describe('InstallationEditorComponent', () => {
  let component: InstallationEditorComponent;
  let fixture: ComponentFixture<InstallationEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstallationEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstallationEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
