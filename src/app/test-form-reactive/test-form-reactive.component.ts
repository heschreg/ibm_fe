import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-test-form-reactive',
  templateUrl: './test-form-reactive.component.html',
  styleUrls: ['./test-form-reactive.component.scss']
})
export class TestFormReactiveComponent implements OnInit {

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }

  profileForm = this.fb.group({
    firstName: [''],
    lastName: [''],
    address: [''],
    dob: [''],
    gender: ['']
  });

  onSubmit() {
   console.log('form data is ', this.profileForm.value);
  }

}
