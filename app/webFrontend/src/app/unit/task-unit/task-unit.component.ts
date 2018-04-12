import {Component, OnInit, Input} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {ActivatedRoute} from '@angular/router';
import {ProgressService} from '../../shared/services/data/progress.service';
import {ITaskUnit} from '../../../../../../shared/models/units/ITaskUnit';
import {ITaskUnitProgress} from '../../../../../../shared/models/progress/ITaskUnitProgress';
import {TaskUnitProgress} from '../../models/progress/TaskUnitProgress';

const knuth = require('knuth-shuffle').knuthShuffle;

@Component({
  selector: 'app-task-unit',
  templateUrl: './task-unit.component.html',
  styleUrls: ['./task-unit.component.scss']
})
export class TaskUnitComponent implements OnInit {

  @Input() taskUnit: ITaskUnit;

  progress: ITaskUnitProgress;
  validationMode = false;
  courseId: string;

  constructor(private route: ActivatedRoute,
              private progressService: ProgressService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    if (!this.taskUnit.progressData) {
      this.progress = new TaskUnitProgress(this.taskUnit);
    } else {
      this.progress = this.taskUnit.progressData;
    }

    if (!this.progress.answers) {
      this.resetProgressAnswers();
    } else {
      this.taskUnit.tasks.forEach(task => {
        if (!this.progress.answers[task._id]) {
          this.progress.answers[task._id] = {};
          task.answers.forEach(answer => this.progress.answers[task._id][answer._id] = false);
        } else {
          task.answers.forEach(answer => {
            if (!this.progress.answers[task._id][answer._id]) {
              this.progress.answers[task._id][answer._id] = false;
            }
          });
        }
      });
    }
    this.shuffleAnswers();
  }

  resetProgressAnswers() {
    this.taskUnit.tasks.forEach(task => {
      // Initialize all as unchecked
      this.progress.answers[task._id] = {};
      task.answers.forEach(answer => this.progress.answers[task._id][answer._id] = false);
    });
  }

  reset() {
    this.resetProgressAnswers();
    this.validationMode = false;
    this.shuffleAnswers();
  }

  validate() {
    this.validationMode = true;

    const handleSave = (promise: Promise<any>) => {
      promise
        .then((savedProgress) => {
          this.progress = savedProgress;
          this.snackBar.open('Progress has been saved', '', {duration: 3000});
        })
        .catch((err) => {
          this.snackBar.open(`An error occurred: ${err.error.message}`, '', {duration: 3000})
        });
    };

    if (!this.progress._id) {
      handleSave(this.progressService.createItem(this.progress));
    } else {
      handleSave(this.progressService.updateItem({
        _id: this.progress._id,
        answers: this.progress.answers,
      }));
    }

  }

  shuffleAnswers() {
    this.taskUnit.tasks.forEach((task) => {
      knuth(task.answers);
    });
  }
}
