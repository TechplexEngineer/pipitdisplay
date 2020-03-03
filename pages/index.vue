<template>
  <div class="container-fluid px-5 py-4">

    <div class="row">
      <div class="col-8">
        <h1 class="text-center">Matches</h1>
        <table class="table table-striped table-dark table-borderless rounded text-center">
          <thead>
            <tr>
              <th class="bg-secondary">Match</th>
              <th class="bg-secondary">Time (s/p)</th>
              <th colspan="3" class="font-weight-bold bg-danger">Red</th>
              <th colspan="3" class="font-weight-bold bg-primary">Blue</th>
              <th class="bg-secondary">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>QM#1</th>
              <td>actual</td>
              <td class="myteam">4909</td>
              <td>Red2</td>
              <td>Red3</td>
              <td>Blue1</td>
              <td>Blue2</td>
              <td>Blue3</td>
              <td>Win 2</td>
            </tr>
            <tr>
              <th>QM#2</th>
              <td>actual</td>
              <td>Red1</td>
              <td>Red2</td>
              <td>Red3</td>
              <td>Blue1</td>
              <td class="myteam">4909</td>
              <td>Blue3</td>
              <td>Loss 1</td>
            </tr>
            <tr>
              <th>QM#3</th>
              <td>5:30pm / 6:30pm</td>
              <td>Red1</td>
              <td class="myteam">4909</td>
              <td>Red3</td>
              <td>Blue1</td>
              <td>Blue2</td>
              <td>Blue3</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="col">
        <h1 class="text-center display-5">Next Match <small class="smaller">QM#5</small></h1>

        <table class="table table-striped table-dark table-borderless rounded shadow-sm">
          <thead class="text-center thead-dark">
            <tr class="rounded-top">
              <th class="font-weight-bold bg-danger">Red</th>
              <th class="font-weight-bold bg-primary">Blue</th>
            </tr>
          </thead>
          <tbody class="text-center rounded-bottom">
            <tr>
              <td>Red1</td>
              <td>Blue1</td>
            </tr>
            <tr>
              <td>Red2</td>
              <td class="myteam">4909</td>
            </tr>
            <tr class="rounded-bottom">
              <td>Red3</td>
              <td>Blue3</td>
            </tr>
          </tbody>
        </table>

        <div class="row text-center">
          <div class="col">Scheduled: 05:30 PM</div>
          <div class="col">Predicted: 05:45 PM</div>
        </div>

      </div>

    </div>

    <div class="row pt-4">
      <div class="col-4">
        <h2 class="text-center">Rankings <small class="smaller">Rank 1 of 35</small></h2>

        <table class="rank-table table table-striped table-dark table-borderless rounded shadow-sm">
          <thead class="text-center thead-dark">
            <tr class="rounded-top">
              <th class="font-weight-bold bg-secondary">Rank</th>
              <th class="font-weight-bold bg-secondary">Team</th>
            </tr>
          </thead>
          <tbody class="text-center rounded-bottom">
            <tr>
              <td>1</td>
              <td class="myteam">4909</td>
            </tr>
            <tr>
              <td>2</td>
              <td>1234</td>
            </tr>
            <tr>
              <td>3</td>
              <td>1234</td>
            </tr>
            <tr>
              <td>4</td>
              <td>1234</td>
            </tr>
            <tr>
              <td>5</td>
              <td>1234</td>
            </tr>
            <tr>
              <td>6</td>
              <td>1234</td>
            </tr>
            <tr>
              <td>7</td>
              <td>1234</td>
            </tr>
            <tr>
              <td>8</td>
              <td>1234</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col">
        <h2 class="text-center">Countdown</h2>
      </div>
    </div>

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
import Logo from '~/components/Logo.vue'

export default {
  components: {
    Logo
  }
}
</script>

<style scoped>
.rounded-top-left { border-top-left-radius: .25rem !important; }
.rounded-top-right { border-top-right-radius: .25rem !important; }
.rounded-bottom-left { border-bottom-left-radius: .25rem !important; }
.rounded-bottom-right { border-bottom-right-radius: .25rem !important; }

.smaller {
  font-size: 45%;
}

.myteam {
  font-weight: bold;
  text-decoration: underline;
  font-size: 125%;
}

.rank-table {

}
</style>
