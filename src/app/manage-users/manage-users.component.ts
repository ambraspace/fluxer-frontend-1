import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Installation } from '../installation';
import { InstallationService } from '../installation.service';
import { User } from '../user';
import { UserService } from '../user.service';
import { faCheck } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {

  iconCheck = faCheck;

  users: User[];

  installations: Installation[];

  form: FormGroup = this.fb.group(
    {
      id: [''],
      username: [''],
      password: [''],
      role: ['USER'],
      firstName: [''],
      lastName: [''],
      email: [''],
      fcmToken: [''],
      phoneNumber: [''],
      installationIds: this.fb.array([]),
      submitType: ['']
    }
  );

  constructor(
    private userService: UserService,
    private installationService: InstallationService,
    private modalService: NgbModal,
    private fb: FormBuilder
    ) { }


  ngOnInit(): void {
    this.getUsers();
  }

  getUsers()
  {
    this.userService.getUsers().subscribe(users => this.users = users);
  }

  get selectedInstallations(): FormArray {
    return this.form.get('installationIds') as FormArray;
  }

  openAddUser(content: any)
  {
    this.form.reset({
      role: "USER",
      installationIds: [],
      submitType: "Add"
    });
    this.getInstallations(()=>{
      this.selectedInstallations.clear();
      this.installations.forEach(i => {
        this.selectedInstallations.push(this.fb.control(false));
      });
    });
    this.modalService.open(content, { size: 'lg' , scrollable: true});
  }

  openEditUser(content: any, id: number)
  {
    let user: User = this.users[this.users.findIndex(u=>u.id==id)];
    this.form.reset({
      id: user.id,
      username: user.username,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      fcmToken: user.fcmToken,
      phoneNumber: user.phoneNumber
    });
    this.getInstallations(()=>{
      this.selectedInstallations.clear();
      this.installations.forEach(i=>{
        if (user.installationIds.findIndex(n=>n==i.id)>=0)
        {
          this.selectedInstallations.push(this.fb.control(true));
        } else {
          this.selectedInstallations.push(this.fb.control(false));
        }
      });
    });
    this.form.get('submitType').setValue("Update");
    this.modalService.open(content, { size: 'lg' , scrollable: true});
  }

  getInstallations(callback)
  {
    this.installationService.getInstallations().subscribe(ins=>{
      this.installations = ins;
      callback && callback();
    });
  }

  addUser()
  {
    let user: User = {} as User;
    user.username = this.form.get("username").value;
    user.password = this.form.get("password").value;
    user.role = this.form.get("role").value;
    user.firstName = this.form.get("firstName").value;
    user.lastName = this.form.get("lastName").value;
    user.email = this.form.get("email").value;
    user.fcmToken = this.form.get("fcmToken").value;
    user.phoneNumber = this.form.get("phoneNumber").value;
    user.installationIds = [] as number[];
    if (user.role!=="ADMIN")
    {
      this.selectedInstallations.controls.forEach((c, i)=>{
          if (c.value)
          {
            user.installationIds.push(this.installations[i].id);
          }
        });
    }
    this.userService.addUser(user).subscribe(
      u => {
        this.users.push(u);
      }
    );
  }

  updateUser()
  {
    let user: User = {} as User;
    user.id = this.form.get("id").value;
    user.username = this.form.get("username").value;
    user.password = this.form.get("password").value;
    user.role = this.form.get("role").value;
    user.firstName = this.form.get("firstName").value;
    user.lastName = this.form.get("lastName").value;
    user.email = this.form.get("email").value;
    user.fcmToken = this.form.get("fcmToken").value;
    user.phoneNumber = this.form.get("phoneNumber").value;
    user.installationIds = [] as number[];
    if (user.role!="ADMIN")
    {
      this.selectedInstallations.controls.forEach((c, i)=>{
          if (c.value)
          {
            user.installationIds.push(this.installations[i].id);
          }
        });
    }
    this.userService.updateUser(user).subscribe(
      u => {
        this.getUsers();
      }
    );
  }

  deleteUser(id: number): void
  {
    if (confirm("Are you sure?"))
    {
      this.userService.deleteUser(id).subscribe(()=>{
        this.users.splice(this.users.findIndex(u=>u.id===id), 1);
      });
    }
  }

}
