import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Grade } from '../models/grade.model';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class GradeService {

  private requestURL = 'http://localhost:3000/grades';
  private grades : Grade[] = [];

  constructor(private http:HttpClient) { }

  getGrades(){
    return this.http.get<Grade[]>(this.requestURL);
  }

  addGrade(grade:Grade){
    return this.http.post<Grade>(this.requestURL,grade,httpOptions);
  }
}
