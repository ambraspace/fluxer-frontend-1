import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlarmEditorComponent } from './alarm-editor.component';

describe('AlarmEditorComponent', () => {
  let component: AlarmEditorComponent;
  let fixture: ComponentFixture<AlarmEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlarmEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlarmEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
