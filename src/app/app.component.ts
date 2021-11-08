import { Component, OnInit } from '@angular/core';
import { Grade } from './models/grade.model';
import { Student } from './models/student.model';
import { StudentService } from './services/student.service';
import { GradeService } from './services/grade.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  //Properties
  students:Student[] = [];
  studentSelectList:Student[]=[];
  grades:Grade[] = [];
  studentGrade : Grade = {student_id:1,grade:0};
  gradeAdded : boolean = false;
  filterName : string = '';
  selectedGrades : number[] = [];
  sortingProperty : string = '';

  constructor(private studentService:StudentService,private gradeService:GradeService){//Dependency Injection

  }

  ngOnInit(): void {
    this.loadStudentsWithGrades();
  }

  /**
   * First load all grades, 
   * then load all students,
   * then set for each student the worst/best/final grade,
   * finally save a SelectList which is always ordered by lastname
   */
  loadStudentsWithGrades(): void{
    this.gradeService.getGrades().subscribe((grd)=>{
      this.grades = grd;
      this.studentService.getStudents().subscribe((stu)=>{
        this.students = stu;
        this.students.forEach((student)=>{
          let gradeList : number[] = this.grades.filter((grade)=>grade.student_id===student.id).map((grade)=>grade.grade);
          if(gradeList.length!=0){
            student.bestGrade = Math.min.apply(null,gradeList);
            student.worstGrade = Math.max.apply(null,gradeList);
            if(student.worstGrade==5){
              student.finalGrade = 5;
            }else{
              student.finalGrade = Math.round(gradeList.reduce((prev,curr)=>prev+curr)/gradeList.length);
            }
          }else{
            student.finalGrade = 0;
          }
        });
        this.studentSelectList = this.studentSelectList.concat(this.students);
        this.studentSelectList.sort((a,b)=>a.lastname.localeCompare(b.lastname));
        this.studentGrade.student_id = this.studentSelectList[0].id;
      });
    });
  }

  isInvalidGrade(){
    return this.studentGrade.grade < 1 || this.studentGrade.grade > 5;
  }

  /**
   * Add new Grade to Database and reset the form
   */
  addGrade(){
    this.gradeService.addGrade(this.studentGrade).subscribe((grade)=>{
      this.studentGrade = {student_id:this.studentSelectList[0].id,grade:0};
      this.loadStudentsWithGrades();
      this.gradeAdded = true;
    });
  }

  noAdd(){
    this.gradeAdded = false;
  }

  /**
   * Checks if the name of the given student matches with the filterName
   * @param student 
   * @returns 
   */
  containsFilterName(student:Student){
    if(this.filterName.trim()==''){
      return true;
    }
    return (student.lastname.toLowerCase().trim().includes(this.filterName.toLowerCase().trim()) || student.firstname.toLowerCase().trim().includes(this.filterName.toLowerCase().trim()))
  }

  addOrRemoveGradeFilter(grade:number){
    this.removeNoGrade();
    if(this.isSelectedGrade(grade)){
      this.removeSelectedGrade(grade);
    }else{
      this.selectedGrades.push(grade);
    }
  }
  /**
   * Changes background colors for the grade buttons by ngStyle 
   * @param grade 
   * @returns 
   */
  isSelectedGrade(grade:number){
    return this.selectedGrades.includes(grade);
  }

  selectedGrade(grade:number){
    if(this.selectedGrades.length == 0){
      return true;
    }
    if(this.selectedGrades.includes(grade)){
        return true;
    }
    return false;   
  }

  selectPositiveGrades(){
    this.removeNoGrade();
    this.selectedGrades = [1,2,3,4];
  }

  selectNegativeGrades(){
    this.removeNoGrade();
    this.selectedGrades = [5];
  }

  selectNoGrade(){
    this.selectedGrades = [0];
  }

  removeNoGrade(){
    if(this.selectedGrades.includes(0)){
      this.removeSelectedGrade(0);
    }
  }

  removeSelectedGrade(grade:number){
    let idx = this.selectedGrades.indexOf(grade);
    this.selectedGrades.splice(idx,1)
  }

  onlyPositve(){
    return this.selectedGrades.includes(1) && this.selectedGrades.includes(2) && this.selectedGrades.includes(3) && this.selectedGrades.includes(4) && !this.selectedGrades.includes(5) && !this.selectedGrades.includes(0);
  }

  onlyNegative(){
    return !this.selectedGrades.includes(1) && !this.selectedGrades.includes(2) && !this.selectedGrades.includes(3) && !this.selectedGrades.includes(4) && this.selectedGrades.includes(5) && !this.selectedGrades.includes(0);
  }

  onlyNoGrade(){
    return !this.selectedGrades.includes(1) && !this.selectedGrades.includes(2) && !this.selectedGrades.includes(3) && !this.selectedGrades.includes(4) && !this.selectedGrades.includes(5) && this.selectedGrades.includes(0);
  }

  sortStudents(sortString:string){
    if(this.sortingProperty!=''){
      if(this.sortingProperty.toLowerCase()==sortString){//Same property, change direction
        if(this.sortingProperty == sortString){//is lowercase
          if(this.sortingProperty == 'name'){
            this.sortByName(false);
          }else if(this.sortingProperty == 'final'){
            this.sortByFinalGrade(false);
          }else{
            this.sortByAge(false);
          }
          this.sortingProperty = this.sortingProperty.toUpperCase();
        }else{//is Uppercase
          this.sortingProperty = this.sortingProperty.toLowerCase();
          if(this.sortingProperty == 'name'){
            this.sortByName(true);
          }else if(this.sortingProperty == 'final'){
            this.sortByFinalGrade(true);
          }else{
            this.sortByAge(true);
          }
        }
      }else{//different property
        this.sortIfNewOrEmpty(sortString);
      }
    }else{//sortingProperty is empty
      this.sortIfNewOrEmpty(sortString);
    }
  }

  sortIfNewOrEmpty(sortString:string){
    this.sortingProperty = sortString;
      if(this.sortingProperty == 'name'){
        this.sortByName(true);
      }else if(this.sortingProperty == 'final'){
        this.sortByFinalGrade(true);
      }else{
        this.sortByAge(true);
      }
  }

  checkIfLowercase(str:string){
    return str == str.toLowerCase();
  }

  sortByName(asc:boolean){
    if(asc){
      this.students.sort((a,b)=>a.lastname.localeCompare(b.lastname));
    }else{
      this.students.sort((a,b)=>b.lastname.localeCompare(a.lastname));
    }
  }

  sortByFinalGrade(asc:boolean){
    if(asc){
      this.students.sort((a,b)=>a.finalGrade-b.finalGrade);
    }else{
      this.students.sort((a,b)=>b.finalGrade-a.finalGrade);
    }
  }

  sortByAge(asc:boolean){
    if(asc){
      this.students.sort((a,b)=>a.age-b.age);
    }else{
      this.students.sort((a,b)=>b.age-a.age);
    }
  }


  




}
