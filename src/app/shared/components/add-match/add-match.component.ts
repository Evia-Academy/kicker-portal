import {Component, Input} from '@angular/core';
import {IPlayers} from '../../interfaces/match.interface';
import {ITeam, IUser} from '../../interfaces/user.interface';
import {Observable} from 'rxjs';
import {MatchesService} from '../../services/matches.service';
import {TeamsService} from '../../services/teams.service';
import {Validators, FormBuilder} from '@angular/forms';


@Component({
  selector: 'app-add-match',
  templateUrl: './add-match.component.html',
  styleUrls: ['./add-match.component.scss']
})
export class AddMatchComponent {

  @Input()
  showingTeams = false;

  @Input()
  data: Observable<IUser[]> | Observable<ITeam[]>;

  public addMatchForm = this.fb.group({
    players: this.fb.group({
      team1: this.fb.group({
        one: [null, Validators.required],
        two: [null, Validators.required],
        teamId: [null],
      }, Validators.required),
      team2: this.fb.group({
        one: [null, Validators.required],
        two: [null, Validators.required],
        teamId: [null],
      }, Validators.required)
    }),
    rounds: this.fb.group({
      one: this.fb.group({
        win: [null, Validators.required],
        dominationTeamOne: [{value: false, disabled: false}],
        dominationTeamTwo: [{value: false, disabled: false}],
      }),
      two: this.fb.group({
        win: [null, Validators.required],
        dominationTeamOne: [{value: false, disabled: false}],
        dominationTeamTwo: [{value: false, disabled: false}],
      }),
      three: this.fb.group({
        win: [null],
        dominationTeamOne: [{value: false, disabled: false}],
        dominationTeamTwo: [{value: false, disabled: false}],
      }),
    })
  });


  constructor(private teamsService: TeamsService,
              private matchesService: MatchesService,
              private fb: FormBuilder) {
  }

  public checkRounds(): boolean {
    const rounds = !(this.addMatchForm.get('rounds.one.win').value === null
      || this.addMatchForm.get('rounds.two.win').value === null
      || (this.addMatchForm.get('rounds.one.win').value === this.addMatchForm.get('rounds.two.win').value));

    if (!rounds) {
      this.addMatchForm.get('rounds.three.win').setValue(null);
      this.addMatchForm.get('rounds.three.dominationTeamOne').setValue(false);
      this.addMatchForm.get('rounds.three.dominationTeamTwo').setValue(false);
      this.addMatchForm.get('rounds.three.dominationTeamOne').enable();
      this.addMatchForm.get('rounds.three.dominationTeamTwo').enable();
    }
    return rounds;
  }

  public saveMatch() {
    console.log('FORM', this.addMatchForm);
    if (!this.showingTeams) {
      this.addMatchForm.get('players.team1.teamId')
        .setValue(this.createTeamId([
          this.addMatchForm.get('players.team1.one').value,
          this.addMatchForm.get('players.team1.two').value
        ]));

      this.addMatchForm.get('players.team2.teamId')
        .setValue(this.createTeamId([
          this.addMatchForm.get('players.team2.one').value,
          this.addMatchForm.get('players.team2.two').value
        ]));
    }

    this.matchesService.add(this.addMatchForm);

  }

  getWins(team: string): number {
    let wins = 0;
    wins = this.addMatchForm.get('rounds.one.win').value === team ? wins + 1 : wins;
    wins = this.addMatchForm.get('rounds.two.win').value === team ? wins + 1 : wins;
    wins = this.addMatchForm.get('rounds.three.win').value === team ? wins + 1 : wins;

    return wins;
  }


  private createTeamId(team): string {
    const sortetTeam: IPlayers[] = team.sort((a, b) => a.id.localeCompare(b.id));
    const teamId = sortetTeam.map(player => player.id).join('');
    const teamName = sortetTeam.map(player => player.name).join('');
    this.checkIfTeamExist(teamId, [sortetTeam[0].id, sortetTeam[1].id], teamName);
    return teamId;
  }

  private checkIfTeamExist(id: string, players: string[], teamName: string) {
    this.teamsService.add(id, players, teamName);
  }
}