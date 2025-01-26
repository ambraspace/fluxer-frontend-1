import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Device } from '../device';
import { DeviceType } from '../device-type';
import { DeviceService } from '../device.service';
import { InstallationService } from '../installation.service';
import { Instruction } from '../instruction';

@Component({
  selector: 'app-command-sender',
  templateUrl: './command-sender.component.html',
  styleUrls: ['./command-sender.component.css']
})
export class CommandSenderComponent implements OnInit {

  @Input()
  installationId: number;

  @Input()
  device: Device;

  deviceType: DeviceType = {} as DeviceType;

  constructor(
    private activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private installationService: InstallationService,
    private deviceService: DeviceService
  ) { }

  commandForm: FormGroup = this.fb.group({
    methodName: [''],
    arguments: ['']
  });

  ngOnInit(): void {
    this.deviceService.getDeviceTypes().subscribe(dts => {
      this.deviceType = dts.find(dt => dt.className == this.device.className),
      this.commandForm.reset({
        methodName: this.deviceType.commandProducers[0],
        arguments: ''
      });
    });
  }

  close()
  {
    this.activeModal.dismiss();
  }

  sendCommand()
  {

    let command: Instruction = {} as Instruction;
    command.id = 0;
    command.deviceId = this.device.id;
    command.methodName = this.commandForm.get('methodName').value;
    command.arguments = [];
    try 
    {
      command.arguments = JSON.parse(`[${this.commandForm.get('arguments').value}]`);
    } catch (err) {}

    this.installationService.sendCommand(this.installationId, command).subscribe(() => {
      this.close();
    });

  }

}
