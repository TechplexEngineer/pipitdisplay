<template>
  <div class="container-fluid px-5 py-4">

    <div class="row">

      <div class="col-7">
        <h2 class="text-center">Matches</h2>
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

              <td>{{calcStatus(match)}}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="col-3">
        <h2 class="text-center display-5">{{nextMatch.title}} <small class="smaller">{{nextMatch.comp_level.toUpperCase()}}#{{nextMatch.match_number}}</small></h2>

        <table class="table table-striped table-dark table-borderless rounded shadow-sm">
          <thead class="text-center thead-dark">
            <tr class="rounded-top">
              <th class="font-weight-bold bg-danger">Red</th>
              <th class="font-weight-bold bg-primary">Blue</th>
            </tr>
          </thead>
          <tbody class="text-center rounded-bottom">
            <tr v-for="idx in 3">
              <td>
                <span :class="{myteam: isMyTeam(nextMatch.alliances.red.team_keys[idx-1])}">{{nextMatch.alliances.red.team_keys[idx-1].replace('frc', '').trim()}}</span>
                <small>{{getRanking(nextMatch.alliances.red.team_keys[idx-1])}}</small>
              </td>
              <td>
                <span :class="{myteam: isMyTeam(nextMatch.alliances.blue.team_keys[idx-1])}">{{nextMatch.alliances.blue.team_keys[idx-1].replace('frc','').trim()}}</span>
                <small>{{getRanking(nextMatch.alliances.blue.team_keys[idx-1])}}</small>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="row text-center">
          <div class="col text-nowrap">Scheduled: {{formatTime(nextMatch.time)}}</div>
          <div class="col text-nowrap">Predicted: {{formatTime(nextMatch.predicted_time)}}</div>
        </div>

        <h2 class="text-center pt-4 pb-2"><small>Countdown:</small> {{countdown(nextMatch.predicted_time)}}</h2>

        <h2 class="text-center">Rankings <small class="smaller">Rank {{ourRank}} of {{teamCount}}</small></h2>

        <table class="rank-table table table-striped table-dark table-borderless rounded shadow-sm">
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
      <div class="col-sm text-center">
        Team: <input type="text" name="team"/>
      </div>
      <div class="col-sm text-center">
        Event: <select><option disabled>---</option></select>
      </div>
      <div class="col-sm text-center">
        Last Updated:
      </div>
    </div>

  </div>
</template>

<script>
import moment from 'moment';
import tba from '~/plugins/tba.js';

let teamKey = "frc4909";
let eventKey = "2020nhgrs";

export default {
  async asyncData ({ params }) {

    let promises = [];

    promises.push(tba.get(`/team/${teamKey}/event/${eventKey}/matches`)
      .then((res) => {
        // sort by scheduled time
        let matches = res.data.sort((a,b) => (a.time - b.time));

        // hide qualifing matches once quarter finals start
        // let foundQF = matches.map((m)=>(m.comp_level)).includes("qf");
        // if (foundQF) {
        //   matches = matches.filter((m) => (m.comp_level !== "qm"));
        // }

        return { matches: matches }
      }));

    promises.push(tba.get(`/event/${eventKey}/rankings`)
      .then((res) => {
        console.log("rankings", JSON.stringify(res.data, null, 4));
        return {
          // limit to the top 8
          rankings : res.data.rankings,
          // teamCount: res.data.rankings.length,
          // ourRank  : res.data.rankings.filter((r)=>(r.team_key === teamKey))[0].rank
        };

      }));

    promises.push(tba.get(`/team/${teamKey}/event/${eventKey}/status`)
      .then(async (res) => {

        let result = {
          teamCount: res.data.qual.num_teams,
          ourRank  : res.data.qual.ranking.rank,
          nextMatch: null
        }

        if (res.data.next_match_key) {
          let nextMatchRes = await tba.get(`/match/${res.data.next_match_key}/simple`);
          result.nextMatch = nextMatchRes.data;
          result.nextMatch.title = "Next Match";
        } else if (res.data.last_match_key) {
          let nextMatchRes = await tba.get(`/match/${res.data.last_match_key}/simple`);
          result.nextMatch = nextMatchRes.data;
          result.nextMatch.title = "Next Match"; //temporary @fixme for screenshots
        }
        // console.log("match", JSON.stringify(result.nextMatch, null, 4));
        return result;
      }));

    let results = await Promise.all(promises);

    return Object.assign({}, ...results);
  },
  methods: {
    calcStatus: function(match) {
      let out = "????";
      if (match.alliances.red.team_keys.includes(teamKey)) {

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

      } else if (match.alliances.blue.team_keys.includes(teamKey)) {

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
    formatTime: function (timestamp) {
      return moment(timestamp*1000).format("h:mma");
    },
    getRanking(teamKey) {
      const team = this.rankings.filter((t)=>(t.team_key === teamKey))[0];
      return `${team.rank} / RP:${team.sort_orders[0]}`;
    },
    countdown(timestamp) {
      let duration = moment.duration(Date.now()-timestamp*1000, 'milliseconds');
      return duration.humanize();
    },
    isMyTeam(team) {
      return (team == teamKey);
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

.rank-table {

}
</style>
