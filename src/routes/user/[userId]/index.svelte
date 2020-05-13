<script context="module">
    export async function preload(page, session) {
        if (session.auth == null) {
            this.redirect(302, "/");
        }
        const {userId} = page.params;
        return {userId};
    }
</script>

<script>
    import { stores } from '@sapper/app';
    import {onMount} from 'svelte';
    
    import {customFetch} from '../../../tools/auth';
    import {formatDate} from '../../../tools/tools';
    import config from '../../../tools/config';

    import { fade } from 'svelte/transition';
    import Loading from '../../../components/Loading.svelte';
    
    export let userId;
    const { session } = stores();
    let jwt_token = $session.user.jwt_token;
    let user;
    let xp;
    let audits;
    let projects;
    let attendance;
    let image;
    let examObjects;
    let examRecords;
    let calendarTable;

    // object, key - date, value - amount of minutes in building
    let timeSpent = {};
    
    // calendar table
    let calendar;
    
    // object, key - eventID, value - exam data and user records 
    let exams = {};

    let inBuilding = false;
    onMount(() => {
        // Start calendar
        customFetch(`${config.API_URL}/user/${userId}`, jwt_token).then(resp => {
            return resp.json();
        }).then(resp => {
            user = resp.user.data.user[0];
            audits = resp.progress.data.user[0].audits.aggregate.count
            xp = resp.progress.data.user[0].xp.aggregate.sum.amount;
            projects = resp.progress.data.user[0].progresses;
            attendance = resp.attendance.data;
            image = resp.image.data[0].face;
            examObjects = resp.exams.data.object;
            examRecords = resp.examRecords.data;

            // exam
            for (let i = 0; i < examObjects.length; i++) {
                const obj = examObjects[i];
                if (obj.events.length < 1) {
                    continue;
                }
                const eventID = obj.events[0].id;
                const objectID = obj.id;
                const createdAt = obj.events[0].createdAt;
                const endAt = obj.events[0].endAt;
                exams[eventID] = {
                    eventID: eventID,
                   objectID: objectID,
                   createdAt: createdAt,
                   endAt: endAt,
                   transactions: []
                }
            }
            for (let key in examRecords) {
                const eventID = key.split("_")[1];
                exams[eventID].transactions = examRecords[key];
            }

            // calendar
            // fill timeSpent object where key is date and value is number of hours spent
            let checkin = null;
            let checkinDate = null;
            for (let i = 0; i < attendance.length; i++) {
                // checkin
                if (attendance[i].status == 1) {
                    // get last check in moment
                    while (i+1 < attendance.length && attendance[i+1].status == 1) {
                        i++;
                    }
                    // save checkin value
                    const datetime = `${attendance[i].date}T${attendance[i].time}`;
                    checkin = new Date(datetime);
                    checkinDate = attendance[i].date;
                }
                // checkout
                else if (attendance[i].status == 2) {
                    // get last checkout moment
                    while (i+1 < attendance.length && attendance[i+1].status == 2) {
                        i++;
                    }
                    const datetime = `${attendance[i].date}T${attendance[i].time}`;
                    if (checkin != null) {
                        const checkout = new Date(datetime);
                        const days = diffDays(checkout, checkin);
                        // if difference between checkin and checkout is > than 1 day
                        if (days > 0) {
                            // get next day after checkin with 00:00:00
                            const tomorrow = new Date(`${checkinDate.split("T")[0]}T00:00:00`);
                            tomorrow.setDate(tomorrow.getDate() + 1);

                            // get current day of checkout with 00:00:00
                            const current = new Date(`${attendance[i].date}T00:00:00`);

                            if (!(checkinDate in timeSpent)) {
                                timeSpent[checkinDate] = 0;
                            }
                            if (!(attendance[i].date in timeSpent)) {
                                timeSpent[attendance[i].date] = 0;
                            }
                            // add time difference to checkin date and checkout date
                            timeSpent[checkinDate] += diffMins(checkin, tomorrow);
                            timeSpent[attendance[i].date] += diffMins(current, checkout);
                        } else {
                            if (!(checkinDate in timeSpent)) {
                                timeSpent[checkinDate] = 0;
                            }
                            // add time difference between checkin and checkout
                            timeSpent[checkinDate] += diffMins(checkin, checkout);
                        }
                    }
                }
            }
            if (attendance.length > 0) {
                const lastIndex = attendance.length-1;
                if (attendance[lastIndex].status == 1) {
                    const now = new Date();
                    const days = diffDays(now, checkin);
                    if (days == 0) {
                        const last = new Date(`${attendance[lastIndex].date}T${attendance[lastIndex].time}`);
                        if (!(attendance[lastIndex].date in timeSpent)) {
                            timeSpent[attendance[lastIndex].date] = 0;
                        }
                        timeSpent[attendance[lastIndex].date] += diffMins(last, now);
                        inBuilding = true;
                    }
                }
            }

            return true;
        }).then(() => {
            calendar = new Cal("divCal");			
            calendar.showcurr();
        }).catch(err => {
            console.log(`Error: ${err}`);
        });
    });

    // $: calendarTable.innerHTML = calendarTableHTML;

    function diffMins(dt2, dt1) {
        var diff =(dt2.getTime() - dt1.getTime()) / 1000;
        diff /= (60);
        return Math.abs(Math.round(diff));
    }

    function diffDays(dt2, dt1) {
        return Math.abs(Math.floor((
            Date.UTC(
                dt2.getFullYear(),
                dt2.getMonth(),
                dt2.getDate()) - Date.UTC(
                                    dt1.getFullYear(),
                                    dt1.getMonth(),
                                    dt1.getDate()) ) /(1000 * 60 * 60 * 24)));
    }

    function showTip(minutes) {
        if (minutes == null) {
            return ''
        }
        const hours = parseInt(minutes / 60);
        const min = minutes % 60;
        return `<span class="tooltiptext">${hours}h${min}m</span>`
    }

    var Cal = function(divId) {
        //Store div id
        this.divId = divId;
        // Days of week, starting on Sunday
        this.DaysOfWeek = [
            'Sun',
            'Mon',
            'Tue',
            'Wed',
            'Thu',
            'Fri',
            'Sat'
        ];
        // Months, stating on January
        this.Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
        // Set the current month, year
        var d = new Date();
        this.currMonth = d.getMonth();
        this.currYear = d.getFullYear();
        this.currDay = d.getDate();
    };

    Cal.prototype.nextMonth = function() {
        if ( this.currMonth == 11 ) {
            this.currMonth = 0;
            this.currYear = this.currYear + 1;
        }
        else {
            this.currMonth = this.currMonth + 1;
        }
        this.showcurr();
    };

    // Goes to previous month
    Cal.prototype.previousMonth = function() {
        if ( this.currMonth == 0 ) {
            this.currMonth = 11;
            this.currYear = this.currYear - 1;
        }
        else {
            this.currMonth = this.currMonth - 1;
        }
        this.showcurr();
    };

    // Show current month
    Cal.prototype.showcurr = function() {
        this.showMonth(this.currYear, this.currMonth);
    };

    // Show month (year, month)
    Cal.prototype.showMonth = function(y, m) {
        var d = new Date()
        // First day of the week in the selected month
        , firstDayOfMonth = new Date(y, m, 1).getDay()
        // Last day of the selected month
        , lastDateOfMonth =  new Date(y, m+1, 0).getDate()
        // Last day of the previous month
        , lastDayOfLastMonth = m == 0 ? new Date(y-1, 11, 0).getDate() : new Date(y, m, 0).getDate();
        var html = '<table class="calendar">';
        // Write selected month and year
        html += '<thead><tr>';
        html += '<td colspan="7">' + this.Months[m] + ' ' + y + '</td>';
        html += '</tr></thead>';
        // Write the header of the days of the week
        html += '<tr class="days">';
        for(var i=0; i < this.DaysOfWeek.length;i++) {
            html += '<td>' + this.DaysOfWeek[i] + '</td>';
        }
        html += '</tr>';
        // Write the days
        var i=1;
        do {
            var dow = new Date(y, m, i).getDay();

            var chk = new Date();
            var chkY = chk.getFullYear();
            var chkM = chk.getMonth();

            const dateStr = `${y}-${(m+1).toString().padStart(2, "0")}-${i.toString().padStart(2, "0")}`;
            var opacity = 0;
            if (dateStr in timeSpent) {
                opacity = timeSpent[dateStr] / (24*60)+0.1;
            }
            // If Sunday, start new row
            if ( dow == 0 ) {
                html += '<tr>';
            }
            // If not Sunday but first day of the month
            // it will write the last days from the previous month
            else if ( i == 1 ) {
                html += '<tr>';
                var k = lastDayOfLastMonth - firstDayOfMonth+1;
                var month = this.currMonth-1;
                var year = this.currYear;
                if (this.currMonth == 0) {
                    month = 11;
                    year--;
                }
                for(var j=0; j < firstDayOfMonth; j++) {
                    const dateStr = `${year}-${(month+1).toString().padStart(2, "0")}-${k.toString().padStart(2, "0")}`;
                    var opacity = 0;
                    if (dateStr in timeSpent) {
                        opacity = timeSpent[dateStr] / (24*60)+0.1;
                    }
                    html += `<td style="background-color: rgba(0, 0, 255, ${opacity});" class="not-current tooltip">${k}${showTip(timeSpent[dateStr])}</td>`;
                    k++;
                }
            }
            // Write the current day in the loop
            
            if (chkY == this.currYear && chkM == this.currMonth && i == this.currDay) {
                html += `<td style="background-color: rgba(0, 0, 255, ${opacity});" class="today tooltip">${i}${showTip(timeSpent[dateStr])}</td>`;
            } else {
                html += `<td style="background-color: rgba(0, 0, 255, ${opacity});" class="normal tooltip">${i}${showTip(timeSpent[dateStr])}</td>`;
            }
            // If Saturday, closes the row
            if ( dow == 6 ) {
                html += '</tr>';
            }
            // If not Saturday, but last day of the selected month
            // it will write the next few days from the next month
            else if ( i == lastDateOfMonth ) {
                var k=1;
                var month = this.currMonth+1;
                var year = this.currYear;
                if (this.currMonth == 11) {
                    month = 0;
                    year++;
                }
                for(dow; dow < 6; dow++) {
                    const dateStr = `${year}-${(month+1).toString().padStart(2, "0")}-${k.toString().padStart(2, "0")}`;
                    var opacity = 0;
                    if (dateStr in timeSpent) {
                        opacity = timeSpent[dateStr] / (24*60)+0.1;
                    }
                    html += `<td style="background-color: rgba(0, 0, 255, ${opacity});" class="not-current tooltip">${k}${showTip(timeSpent[dateStr])}</td>`;
                    k++;
                }
            }
            i++;
        }while(i <= lastDateOfMonth);
        // Closes table
        html += '</table>';
        // Write HTML to the div
        calendarTable.innerHTML = html;
    };

    $: presence = inBuilding ? "in" : "out";
    $: githubLogin = user == null ? "Loading..." : user.githubLogin;
</script>


<svelte:head>
	<title>
        {githubLogin} | dashboard
    </title>
</svelte:head>

{#if user}
<h1>
    <span class="legend {presence}"></span>
    {user.firstName} <strong>"{user.githubLogin}"</strong> {user.lastName}
</h1>
<div class="flex-grid">
    <div class="profile-header">
        <div class="image">
            <img src="data:image/png;base64, {image}" alt="{user.githubLogin}" />
        </div>
        <div class="info">
            <p>{user.tel}</p>
            <p>{xp || 0} <strong>xp</strong></p>
            <p>{audits} <strong>audits</strong></p>
            <p><a href="{`${config.URL}/user/${userId}/piscine`}">piscine</a></p>
        </div>
    </div>
</div>

<div class="flex-grid">
    <div class="projects">
        <h2>Projects</h2>
        <div class="calendar-wrapper" style="height:25rem; overflow:auto;">
            <table>
                {#each projects as project (project.object.name)}
                <tr>
                    <td>{project.object.name}</td>
                </tr>
                {/each}
            </table>
        </div>
    </div>
    <div>
        <h2>Attendance</h2>
        <div class="calendar-wrapper">
            <button id="btnPrev" type="button" on:click="{() => {calendar.previousMonth()}}">Prev</button>
            <button id="btnNext" type="button" on:click="{() => {calendar.nextMonth()}}">Next</button>
            <div id="divCal" bind:this={calendarTable}></div>
        </div>
    </div>
</div>
<h2>Exams</h2>
{#each Object.keys(exams) as eventID (eventID)}
    <h3>Exam {formatDate(new Date(exams[eventID].createdAt))} {exams[eventID].transactions.length}</h3>
{/each}

{:else}
    <div transition:fade>
        <Loading/>
    </div>
{/if}


<style>

p {
    margin: 0;
}

.profile-header {
    display: flex;
}

.profile-header img {
    height: 10rem;
    border-radius:5px;
}

.profile-header > div {
    margin: 0 20px 0 0;
}

.profile-header > div:last-child {
	margin-right: 0;
}

.legend {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border-radius: 100%;
}

.in {
    background-color: #2ecc71;
}

.out {
    background-color: #de8178;
}

.projects table {
  clear: both;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 3px;
  border-collapse: collapse;
  color: #444;
}
.projects td {
  text-align: left;
  padding: 3px 1rem;
  vertical-align: middle;
  border-right: 1px solid #ddd;
  border-top: 1px solid #ddd;
}

.calendar-wrapper {
  width: 100%;
  margin: 0em auto;
}
:global(table.calendar) {
  clear: both;
  width: 100%;
  border: 1px solid #dcdcff;
  border-radius: 3px;
  border-collapse: collapse;
  color: #444;
}
:global(.calendar td) {
  height: 48px;
  text-align: center;
  vertical-align: middle;
  border-right: 1px solid #dcdcff;
  border-top: 1px solid #dcdcff;
  width: 14.28571429%;
}
:global(.calendar td.not-current) {
  color: #c0c0c0;
}
:global(td.today) {
  font-weight: 700;
  color: #28283b;
  font-size: 1em;
}
:global(.calendar thead td) {
  border: none;
  color: #28283b;
  text-transform: uppercase;
  font-size: 1em;
}
#btnPrev {
  float: left;
  margin-bottom: 20px;
}
#btnNext {
  float: right;
  margin-bottom: 20px;
}
#btnPrev,
#btnNext {
  background: transparent;
  border: none;
  outline: none;
  font-size: 1em;
  color: #c0c0c0;
  cursor: pointer;
  font-family: "Roboto Condensed", sans-serif;
  text-transform: uppercase;
  -webkit-transition: all 0.3s ease;
  transition: all 0.3s ease;
}
#btnPrev:hover,
#btnNext:hover {
  color: #28283b;
  font-weight: bold;
}

/* Tooltip container */
:global(.tooltip) {
  position: relative;
  border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
}

/* Tooltip text */
:global(.tooltip .tooltiptext) {
  visibility: hidden;
  width: 60px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;

  bottom: 100%;
  left: 0%;
  margin-left: -10px;
 
  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
}

/* Show the tooltip text when you mouse over the tooltip container */
:global(.tooltip:hover .tooltiptext) {
  visibility: visible;
}

:global(.tooltiptext:hover) {
  visibility: hidden;
}

</style>
