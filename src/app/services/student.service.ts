import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Student } from 'src/app/models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private requestURL = 'http://localhost:3000/students';

  constructor(private http:HttpClient) { }

  getStudents(){
    return this.http.get<Student[]>(this.requestURL);
  }
}
