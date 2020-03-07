<template>
  <div class="container-fluid px-5 py-4">

    <div class="row">

      <div class="col-8">
        <h2 class="text-center">{{ eventName }} - Matches</h2>
        <table class="table table-striped table-dark table-borderless rounded text-center">
          <thead>
            <tr>
              <th class="bg-secondary">Match</th>
              <th class="bg-secondary">Time <small>(scheduled / predicted / acutal)</small></th>
              <th colspan="3" class="font-weight-bold bg-danger">Red</th>
              <th colspan="3" class="font-weight-bold bg-primary">Blue</th>
              <th colspan="3" class="bg-secondary">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="match in matches">
              <th>{{match.comp_level.toUpperCase()}}#{{match.match_number}}</th>
              <td>{{formatTime(match.time)}} / {{formatTime(match.predicted_time)}} / {{formatTime(match.actual_time)}}</td>
              <td
                v-for="team in match.alliances.red.team_keys"
                :class="{myteam: isMyTeam(team)}"
                >{{team.replace('frc','')}}</td>
              <td
                v-for="team in match.alliances.blue.team_keys"
                :class="{myteam: isMyTeam(team)}"
                >{{team.replace('frc','')}}</td>

              <td :class="{'text-danger': redWin(match), 'text-primary': blueWin(match)}">{{calcStatus(match)}}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="col-4">
        <h2 class="text-center display-5"> <small class="smaller" v-if="team">FRC{{ team }}</small> {{nextMatch.title}} <small class="smaller">{{nextMatch.comp_level}}#{{nextMatch.match_number}}</small></h2>

        <table class="table table-striped table-dark table-borderless rounded shadow-sm">
          <thead class="text-center thead-dark">
            <tr class="rounded-top">
              <th class="font-weight-bold bg-danger">Red</th>
              <th class="font-weight-bold bg-primary">Blue</th>
            </tr>
          </thead>
          <tbody class="text-center rounded-bottom">
            <tr v-if="'alliances' in nextMatch" v-for="idx in 3">
              <td>
                <span :class="{myteam: isMyTeam(nextMatch.alliances.red.team_keys[idx-1])}">{{nextMatch.alliances.red.team_keys[idx-1].replace('frc', '').trim()}}</span>
                <br>
                <small>{{getRanking(nextMatch.alliances.red.team_keys[idx-1])}}</small>
              </td>
              <td>
                <span :class="{myteam: isMyTeam(nextMatch.alliances.blue.team_keys[idx-1])}">{{nextMatch.alliances.blue.team_keys[idx-1].replace('frc','').trim()}}</span>
                <br>
                <small>{{getRanking(nextMatch.alliances.blue.team_keys[idx-1])}}</small>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="row text-center">
          <div class="col text-nowrap">Scheduled: {{formatTime(nextMatch.time)}}</div>
          <div class="col text-nowrap">Predicted: {{formatTime(nextMatch.predicted_time)}}</div>
        </div>

        <h2 class="text-center pt-4 pb-2"><small>Countdown:</small>
          <VueCountdown :time="nextMatch.countdown">
            <template slot-scope="props">{{ props.hours }}h {{ props.minutes }}m {{ props.seconds }}s</template>
          </VueCountdown>
        </h2>


        <h2 class="text-center">Rankings <small class="smaller">Rank {{ourRank}} of {{teamCount}}</small></h2>

        <table class="table table-striped table-dark table-borderless rounded shadow-sm">
          <thead class="text-center thead-dark">
            <tr class="rounded-top">
              <th class="font-weight-bold bg-secondary">Rank</th>
              <th class="font-weight-bold bg-secondary">Team</th>
              <th class="bg-secondary">RP</th>
              <th class="bg-secondary">W-L-T</th>
              <th class="bg-secondary">Played</th>
            </tr>
          </thead>
          <tbody class="text-center rounded-bottom">
            <tr  v-for="team in rankings.slice(0,8)">
              <td>{{team.rank}}</td>
              <td :class="{myteam: isMyTeam(team.team_key)}">{{team.team_key.replace('frc', '')}}</td>
              <td>{{team.sort_orders[0]}}</td>
              <td>{{team.record.wins}}-{{team.record.losses}}-{{team.record.ties}}</td>
              <td>{{team.matches_played}}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>

    <div class="row pt-4">
      <div class="col-2"></div>
    </div>

    <!-- Data Input -->
    <div class="row text-muted">
      <div class="col-2 text-center">
        Optional Team Filter: <b-form-input type="number" v-model="team" placeholder="####"></b-form-input>
      </div>
      <div class="col-4 text-center">
        Event:
        <b-form-select v-model="event" :options="eventOptions"></b-form-select>
      </div>
      <div class="col-3 text-center">
        TBA API Key:
        <b-form-input type="password" v-model="tba_key"></b-form-input>
      </div>
      <div class="col-3 text-center">
        Last Updated: <br> {{moment(updated).format('h:mm:ssa YYYY-MMM-DD')}}
      </div>
    </div>

  </div>
</template>

<script>
  import VueCountdown from '@chenfengyuan/vue-countdown';
  import moment from 'moment';
  import tba from '~/plugins/tba.js';

  // from https://codeburst.io/throttling-and-debouncing-in-javascript-b01cad5c8edf
  // https://stackoverflow.com/questions/45178621/how-to-correctly-use-vue-js-watch-with-lodash-debounce
  const debounce = (func, delayms) => {
    let inDebounce
    return function() {
      const context = this
      const args = arguments
      clearTimeout(inDebounce)
      inDebounce = setTimeout(() => func.apply(context, args), delayms)
    }
  }

  let updateHandle = null;

  export default {
    components: {
      VueCountdown
    },
    data: function() {
      return {
        team      : null,
        event     : null,
        tba_key   : null,
        rankings  : [],
        nextMatch : {},
        matches   : [],
        ourRank   : 'unknown',
        teamCount : 'unknown',
        updated   : new Date(),
        events    : [],
        isFinals  : false
      }
    },
    async asyncData ({ params }) {
    },
    mounted() {
      // if we have a team number and/or event key stored, restore them into the
      // component's data. Changes to the components data trigger the corresponding
      // functions in the watch section.
      if (localStorage.getItem("teamNumber")) {
        this.team = localStorage.getItem("teamNumber") || "4909";
      }
      if (localStorage.getItem("eventKey")) {
        this.event = localStorage.getItem("eventKey") || "2020nhgrs";
      }
      if (localStorage.getItem("tba_key")) {
        this.tba_key = localStorage.getItem("tba_key");
      }

      updateHandle = setInterval(this.updateData, 10*1000);
    },
    beforeDestroy() {
      clearInterval(updateHandle);
      updateHandle = null;
    },
    methods: {
      calcStatus(match) {
        let out = "????";

        // match not yet played
        if (! match.actual_time) {
          return "";
        }

        // no team filter
        if (! this.team) {

          // the actual_time can be returned before the score_breakdown is posted
          if (! match.score_breakdown) {
            return "...."
          }
          if (match.alliances.red.score > match.alliances.blue.score) {
            out = "Red";
            // Show the ranking points for qualification matches
            if (match.comp_level == "qm") {
              out += ` ${match.score_breakdown.red.rp} / ${match.score_breakdown.blue.rp}`
            }
          } else if (match.alliances.red.score < match.alliances.blue.score) {
            out = "Blue";
            // Show the ranking points for qualification matches
            if (match.comp_level == "qm") {
              out += ` ${match.score_breakdown.blue.rp} / ${match.score_breakdown.red.rp}`
            }
          } else {
            out = "Tie";
          }

          return out;
        }

        if (match.alliances.red.team_keys.includes(`frc${this.team}`)) {

          if (match.alliances.red.score > match.alliances.blue.score) {
            out = "Win";
          } else if (match.alliances.red.score < match.alliances.blue.score) {
            out = "Loss";
          } else {
            out = "Tie";
          }
          if (match.comp_level == "qm") {
            out += ` ${match.score_breakdown.red.rp}`
          }

        } else if (match.alliances.blue.team_keys.includes(`frc${this.team}`)) {

          if (match.alliances.blue.score > match.alliances.red.score) {
            out = "Win";
          } else if (match.alliances.blue.score < match.alliances.red.score) {
            out = "Loss";
          } else {
            out = "Tie";
          }
          if (match.comp_level == "qm") {
            out += ` ${match.score_breakdown.blue.rp}`
          }
        } else {
          return "????";
        }
        return out;
      },
      redWin(match) {
        if (! match.actual_time) {
          return false;
        }
        return match.alliances.red.score > match.alliances.blue.score;
      },
      blueWin(match) {
        if (! match.actual_time) {
          return false;
        }
        return match.alliances.blue.score > match.alliances.red.score
      },
      formatTime(timestamp) {
        if (! timestamp) {
          return "--:----";
        }
        return moment(timestamp*1000).format("h:mma");
      },
      getRanking(teamKey) {
        if (!this.rankings || !this.rankings.length) {
          return "no rankings loaded yet";
        }
        const team = this.rankings.filter((t)=>(t.team_key === teamKey))[0];
        return `Rank ${team.rank} / RP ${team.sort_orders[0]}`;
      },
      isMyTeam(teamKey) {
        return (`frc${this.team}` == teamKey);
      },
      updateData: debounce(function() {
        console.log("refresh data");
        if (!this.event || !this.tba_key) {
          console.log(`Missing required info: event:${this.event} key:${this.tba_key}`);
          return;
        }
        let team = this.team;
        let event = this.event;
        this.updated = new Date();

        tba.get(`/event/${event}/rankings`).then((res) => {
          // console.log("rankings", JSON.stringify(res.data, null, 4));
          this.rankings = res.data.rankings;
        });

        if (!this.team) {
          console.log('No team filter set, showing all matches');

          tba.get(`/event/${event}/matches`).then((res) => {
            // sort by scheduled time
            let matches = res.data.sort((a,b) => (a.time - b.time));

            // hide qualifing matches once quarter finals start
            this.isFinals = matches.map((m)=>(m.comp_level)).includes("qf");
            if (this.isFinals) {
              matches = matches.filter((m) => (m.comp_level !== "qm"));
            }

            this.matches = matches;

            let notPlayed = matches.filter(m=>(! m.actual_time));

            // current match is [0] net match is [1]
            this.nextMatch = notPlayed.sort((a,b)=>(a.time-b.time))[1]
            this.nextMatch.countdown = (this.nextMatch.predicted_time*1000 - Date.now());
            if (this.nextMatch.countdown < 0) {
              console.log("Countdown is zero");
              this.nextMatch.countdown = 0;
            }
            this.nextMatch.title = "Next Match";
            this.nextMatch.comp_level = this.nextMatch.comp_level.toUpperCase();

            // console.log("matches", JSON.stringify(, null, 4));
          });
          return;
        }

        try {
          tba.get(`/team/frc${team}/event/${event}/matches`).then((res) => {
            // sort by scheduled time
            let matches = res.data.sort((a,b) => (a.time - b.time));

            // hide qualifing matches once quarter finals start
            this.isFinals = matches.map((m)=>(m.comp_level)).includes("qf");
            if (this.isFinals) {
              matches = matches.filter((m) => (m.comp_level !== "qm"));
            }

            this.matches = matches;
          });

          tba.get(`/team/frc${team}/event/${event}/status`).then(async (res) => {

            if (!res.data) {
              console.log("no data returned");
              return;
            }

            this.teamCount = res.data.qual.num_teams;
            this.ourRank   = res.data.qual.ranking.rank;

            if (res.data.next_match_key) {
              let nextMatchRes = await tba.get(`/match/${res.data.next_match_key}/simple`);
              this.nextMatch = nextMatchRes.data;
              this.nextMatch.title = "Next Match";
              this.nextMatch.comp_level = this.nextMatch.comp_level.toUpperCase();
            } else if (res.data.last_match_key) {
              let nextMatchRes = await tba.get(`/match/${res.data.last_match_key}/simple`);
              this.nextMatch = nextMatchRes.data;
              this.nextMatch.title = "Last Match"; //temporary @fixme for screenshots
              this.nextMatch.comp_level = this.nextMatch.comp_level.toUpperCase();
            } else {
              this.nextMatch = {};
            }
          });
        } catch(e) {
          // we expect that sometimes the debounce will happen before the user has completed
          // entering the team
        }
      }, 500),
      moment: moment

    },
    computed: {
      eventOptions: function () {
        // events aren't loaded yet
        if (!this.events) {
          return [];
        }
        let events = this.events.map(event => ({
          value: event.key,
          text : event.name
        }));
        events.sort((a,b)=>(a.text.localeCompare(b.text)));
        events.unshift({ value: null, text: 'Please select an event' });
        return events;
        // <option v-for="event in events" name="event.key">{{ event.name }}</option>
      },
      eventName: function() {
        console.log("options", this.eventOptions, this.event);
        let events = this.eventOptions.filter(e=>(e.value==this.event));
        console.log("events", events);
        if (events.length) {
          return events[0].text
        }
        return "";
      }
    },
    watch: {
      event: function(value, oldValue) {
        console.log(`Event changed from ${oldValue} to ${value}`);
        localStorage.setItem("eventKey", value);

        this.updateData();
      },
      team: function (value, oldValue) {
        console.log(`team changed from ${oldValue} to ${value}`);
        localStorage.setItem("teamNumber", value);

        this.updateData();
      },
      tba_key(value, oldValue) {
        console.log(`tba_key changed from ${oldValue} to ${value}`);
        localStorage.setItem("tba_key", value);
        tba.defaults.headers.common['X-TBA-Auth-Key'] = value;

        // load the list of events for this year
        // used for the event dropdown
        tba.get(`/events/${new Date().getFullYear()}`).then((res) => {
          this.events= res.data;
        });

        this.updateData();
      }
    }

  }

</script>

<style scoped>
  .rounded-top-left { border-top-left-radius: .25rem !important; }
  .rounded-top-right { border-top-right-radius: .25rem !important; }
  .rounded-bottom-left { border-bottom-left-radius: .25rem !important; }
  .rounded-bottom-right { border-bottom-right-radius: .25rem !important; }

  .smaller {
    font-size: 70%;
  }

  .myteam {
    font-weight: bold;
    text-decoration: underline;
    font-size: 125%;
  }
</style>
