import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faInfo, faListAlt, faWrench } from '@fortawesome/free-solid-svg-icons';
import { first } from 'rxjs/operators';
import { LaBM } from 'src/app/models/activity/LaBM';
import { AccountService } from 'src/app/services/account.service';
import { ActivitiesService } from 'src/app/services/activities.service';
import { DataService } from 'src/app/services/data.service';
import { ScenariosService } from 'src/app/services/scenarios.service';
declare var $: any;

@Component({
  selector: 'app-learning-activity-create',
  templateUrl: './learning-activity-create.component.html',
  styleUrls: ['./learning-activity-create.component.scss']
})
export class LearningActivityCreateComponent implements OnInit {

  //** Font awesome icons */
  faInfo = faInfo;
  faListAlt = faListAlt;
  faWrench = faWrench;

  //** Configuration */
  loading = false;
  submitted = false;
  returnUrl: string;
  error: string;
  title: string = "Create Activity";
  laTypes: any;
  strategyMethods: any;
  laCollaborations: any;
  digitalTools: any[] = [];
  digitalDevices: any[] = [];
  digitalGames: any[] = [];
  otherTools: any[] = [];
  laTypeError: boolean;

  //** Models */
  model: LaBM = new LaBM();
  teachingSubjects: any;
  keywords: any;
  grades: number[] = [];
  ordinalNumbers: number[] = [];
  scenarioId: number;


  constructor(private dataService: DataService,
    private router: Router,
    private activitiesService: ActivitiesService,
    private route: ActivatedRoute,
    private scenariosService: ScenariosService,
    private accountService: AccountService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.scenarioId = params['scenarioId'];
    })
    this.scenariosService.getScenario(this.scenarioId).subscribe(scenario => {
      if (scenario['userId'] !== this.accountService.currentUserValue['id']) {
        this.router.navigate(['404']);
      }
    })
    this.getDropdowns();
    this.jqueryFunctions();
  }

  onSubmit() {
    this.submitted = true;
    this.loading = true;

    console.log(this.model);
    this.activitiesService.create(this.scenarioId, this.model)
      .pipe(first())
      .subscribe(
        data => {
          this.router.navigate(['/activities/', data['activityId']]);
        },
        (error: string) => {
          this.error = error;
          this.loading = false;
        }
      )
  }

  validateLaType(value) {
    if (value === 0) {
      this.laTypeError = true;
    } else {
      this.laTypeError = false;
    }
  }

  onNext() {
    console.log(this.model);
    this.submitted = true;
  }

  getDropdowns() {

    this.dataService.getLaTypes().subscribe(laTypes => {
      this.laTypes = laTypes;
    })

    this.dataService.getStrategyMethods().subscribe(strategyMethods => {
      this.strategyMethods = strategyMethods;
    })

    this.dataService.getLaCollaborations().subscribe(laCollaborations => {
      this.laCollaborations = laCollaborations;
    })

    this.dataService.getTeachingAids().subscribe(LaTeachingAids => {
      LaTeachingAids.forEach(element => {
        switch (element['teachingAidTypeId']) {
          case 1:
            this.digitalTools.push(element);
            break;
          case 2:
            this.digitalDevices.push(element);
            break;
          case 3:
            this.digitalGames.push(element);
            break;
          case 4:
            this.otherTools.push(element);
            break;
          default:
            break;
        }
      });
    })

    for (let i = 1; i <= 8; i++) {
      this.grades.push(i);
    }

    for (let i = 1; i <= 100; i++) {
      this.ordinalNumbers.push(i);
    }
  };

  jqueryFunctions() {
    function scroll_to_class(element_class, removed_height) {
      var scroll_to = $(element_class).offset().top - removed_height;
      if ($(window).scrollTop() != scroll_to) {
        $('html, body').stop().animate({ scrollTop: scroll_to }, 0);
      }
    }

    function bar_progress(progress_line_object, direction) {
      var number_of_steps = progress_line_object.data('number-of-steps');
      var now_value = progress_line_object.data('now-value');
      var new_value = 0;
      if (direction == 'right') {
        new_value = now_value + (100 / number_of_steps);
      }
      else if (direction == 'left') {
        new_value = now_value - (100 / number_of_steps);
      }
      progress_line_object.attr('style', 'width: ' + new_value + '%;').data('now-value', new_value);
    }

    $(document).ready(function () {
      /*
          Form
      */
      $('.f1 fieldset:first').fadeIn('slow');

      // next step
      $('.f1 .btn-next').on('click', function () {
        var parent_fieldset = $(this).parents('fieldset');
        var next_step = true;
        this.submitted = true;
        // navigation steps / progress steps
        var current_active_step = $(this).parents('.f1').find('.f1-step.active');
        var progress_line = $(this).parents('.f1').find('.f1-progress-line');

        if (next_step && this.submitted) {
          parent_fieldset.fadeOut(400, function () {
            // change icons
            current_active_step.removeClass('active').addClass('activated').next().addClass('active');
            // progress bar
            bar_progress(progress_line, 'right');
            // show next step
            $(this).next().fadeIn();
            // scroll window to beginning of the form
            scroll_to_class($('.f1'), 20);
          });
        }

      });

      // previous step
      $('.f1 .btn-previous').on('click', function () {
        // navigation steps / progress steps
        var current_active_step = $(this).parents('.f1').find('.f1-step.active');
        var progress_line = $(this).parents('.f1').find('.f1-progress-line');

        $(this).parents('fieldset').fadeOut(400, function () {
          // change icons
          current_active_step.removeClass('active').prev().removeClass('activated').addClass('active');
          // progress bar
          bar_progress(progress_line, 'left');
          // show previous step
          $(this).prev().fadeIn();
          // scroll window to beginning of the form
          scroll_to_class($('.f1'), 20);
        });
      });
    });
  }

}
