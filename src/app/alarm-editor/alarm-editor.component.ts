import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Alarm } from '../alarm';
import { AlarmService } from '../alarm.service';
import { Device } from '../device';
import { DeviceType } from '../device-type';
import { DeviceService } from '../device.service';
import { Relation } from '../relation';
import { faPlusCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AlarmCloneInstruction } from '../alarm-clone-instruction';
import { InstallationService } from '../installation.service';

@Component({
  selector: 'app-alarm-editor',
  templateUrl: './alarm-editor.component.html',
  styleUrls: ['./alarm-editor.component.css']
})
export class AlarmEditorComponent implements OnInit {

  @Input()
  installationId: number;

  @Input()
  locationId: number;

  @Input()
  device: Device;

  iconAdd = faPlusCircle;
  iconDelete = faTrash;

  deviceType: DeviceType = {} as DeviceType;

  alarms: Alarm[];

  constructor(
    private activeModal: NgbActiveModal,
    private alarmService: AlarmService,
    private deviceService: DeviceService,
    private installationService: InstallationService,
    private fb: FormBuilder) { }

    alarmForm: FormGroup = this.fb.group({
      id: [0],
      message: [''],
      delay: [0],
      parameterName: [''],
      relation: [''],
      value: ['']
    });

  ngOnInit(): void {

    this.deviceService.getDeviceTypes().subscribe(dts => {
      this.deviceType = dts.find(dt => dt.className === this.device.className);
      this.getAlarms();
      this.alarmForm.reset({
        id: 0,
        message: '',
        delay: 0,
        parameterName: this.deviceType.readableParameters[0],
        relation: 'EQUALS',
        value: ''
      });
    });

  }

  close()
  {
    this.activeModal.dismiss();
  }

  getRelationKeys(): string[]
  {
    let keys: string[] = [];
    Object.keys(Relation).forEach(s=>{
      keys.push(s);
    })
    return keys;
  }

  getRelationValue(key: string)
  {
    return Relation[key];
  }


  getAlarms()
  {
    this.alarmService.getAlarms
    (
      this.installationId,
      this.locationId,
      this.device.id
    ).subscribe(als => {
      this.alarms = als;
    });
  }

  addAlarm()
  {
    let alarm: Alarm = {} as Alarm;
    alarm.message = this.alarmForm.controls.message.value;
    alarm.parameterName = this.alarmForm.controls.parameterName.value;
    alarm.relation = this.alarmForm.controls.relation.value;
    alarm.value = this.alarmForm.controls.value.value;
    alarm.delay = this.alarmForm.controls.delay.value;
    this.alarmService.addAlarm
    (
      this.installationId,
      this.locationId,
      this.device.id,
      alarm
    ).subscribe(
      al => {
        this.alarms.push(al);
        this.alarmForm.reset({
          id: 0,
          message: "",
          delay: 0,
          parameterName: this.deviceType.readableParameters[0],
          relation: "EQUALS",
          value: ""
        })
      }
    )
  }

  deleteAlarm(id: number)
  {

    if (!confirm("Are you sure?")) return;
    
    this.alarmService.deleteAlarm
    (
      this.installationId,
      this.locationId,
      this.device.id,
      id
    ).subscribe(()=>{
      this.getAlarms();
    })
  }

  clone()
  {
    if (confirm("Are you sure you want to clone these alarms\nto all other devices of the same type?"))
    {

      let instruction = {} as AlarmCloneInstruction;
      instruction.deviceId = this.device.id;
      instruction.deleteTargetAlarms = false;

      if (confirm("Delete existing alarms on target devices?"))
      {
        instruction.deleteTargetAlarms = true;
      }

      this.installationService.cloneAlarms(this.installationId, instruction).subscribe(() => this.close());

    }
  }
  
}
