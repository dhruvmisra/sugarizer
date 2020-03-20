// Chess component
let StatsTemplate = {
	template: `
		<div class="stats-container">
			<div class="row bg-white mx-0 align-items-center" v-if="isHost && runningPoll != null">
				<button class="btn btn-danger btn-pause m-2 mr-auto" v-on:click="$emit('stop-poll')"></button>
				<h5 class="mx-auto">{{ runningPoll.question }}</h5>
				<button class="btn btn-stats btn-play m-2 ml-auto" v-bind:class="{ 'btn-info': statsOpen }" v-on:click="$emit('close-stats')"></button>
			</div>

			<div class="row p-3 justify-content-center mx-0">
				<div class="w-50" v-show="runningPoll && runningPoll.type != 'Input'">
					<canvas class="bg-white" id="stats" width="400" height="400"></canvas>
				</div>
				<div class="w-50 p-3">					
					<div class="first-vote" v-if="answers.length > 0">
						<h6 class="text-white">First voter:</h6>
						<div class="card p-3 row mx-0">
							<img src="./icons/owner-icon.svg" style="width: 30px">	
							<span>{{ answers[0] ? answers[0].user.name : '' }}</span>
						</div>
					</div>

					<div class="all-votes" v-if="answers.length > 0">
						<h6 class="text-white">All votes: </h6>
						<div class="card p-3 row mx-0" v-for="answer in answers" v-bind:key="answer.user.networkId">
							<img src="./icons/owner-icon.svg" style="width: 30px">
							{{ answer.user.name}} : {{ runningPoll.type == 'Input' ? answer.answer.answerText : runningPoll.type == 'YesNo' ? answer.answer.selectedOption : runningPoll.options[answer.answer.selectedOption]}}
						</div>
					</div>
				</div>
			</div>
		</div>
	`,
	props: ['runningPoll', 'answers', 'statsOpen', 'isHost'],
	data: function() {
		return {
			statsChart: null,
			statsData: {
				labels: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
				datasets: [{
					label: '# of Votes',
					data: [1, 1, 1, 1],
					backgroundColor: [
						'rgba(255, 99, 132, 0.8)',
						'rgba(54, 162, 235, 0.8)',
						'rgba(255, 206, 86, 0.8)',
						'rgba(75, 192, 192, 0.8)',
						'rgba(153, 102, 255, 0.8)',
						'rgba(255, 159, 64, 0.8)'
					],
					borderColor: [
						'rgba(255, 99, 132, 1)',
						'rgba(54, 162, 235, 1)',
						'rgba(255, 206, 86, 1)',
						'rgba(75, 192, 192, 1)',
						'rgba(153, 102, 255, 1)',
						'rgba(255, 159, 64, 1)'
					],
					borderWidth: 1
				}]
			},
			statsOptions: {
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true
						}
					}]
				}
			},
			l10n: {
				stringLevel: '',
				stringMoves: '',
				stringPlayer: '',
				stringComputer: '',
				stringTurn: '',
				stringPlayingAgainst: '',
				stringYouAre: '',
				stringBlack: '',
				stringWhite: '',
				stringYouAreSpectator: '',
				stringToMove: '',
				stringVeryEasy: '',
				stringEasy: '',
				stringModerate: '',
				stringHard: '',
				stringVeryHard: '',
				stringAreIn: '',
				stringIsIn: '',
				stringCheck: '',
				stringCheckmate: '',
				stringGameOver: '',
				stringDrawPosition: '',
				stringYou: '',
				stringOpponent: ''
			}
		}
	},
	computed: {

  },
	watch: {
		runningPoll: function(newVal, oldVal) {
			if(this.runningPoll == null) return;
			if(this.runningPoll.type == 'MCQ') {
				this.statsData.labels = [];
				this.statsData.datasets[0].data = [];
				this.runningPoll.options.forEach(option => {
					this.statsData.labels.push(option);
					this.statsData.datasets[0].data.push(0);
				});
				this.statsChart.update();
			} else if(this.runningPoll.type == 'YesNo') {
				this.statsData.labels = ['Yes', 'No'];
				this.statsData.datasets[0].data = [0 ,0];
				this.statsChart.update();
			}
		},
    answers: function(newVal, oldVal) {
			if(this.runningPoll == null) return;
			if(this.runningPoll.type == 'MCQ') {
				this.answers.forEach(answer => {
					this.statsData.datasets[0].data[answer.answer.selectedOption]++;
				});
				this.statsChart.update();
			} else if(this.runningPoll.type == 'YesNo') {
				this.answers.forEach(answer => {
					if(answer.answer.selectedOption == 'Yes') {
						this.statsData.datasets[0].data[0]++;
					} else {
						this.statsData.datasets[0].data[1]++;
					}
				});
				this.statsChart.update();
			}
		}
	},
	mounted: function() {
		var ctx = document.getElementById('stats');
		this.statsChart = new Chart(ctx, {
				type: 'bar',
				data: this.statsData,
				options: this.statsOptions
		});
	},
	methods: {
		localized: function (localization) {
			localization.localize(this.l10n);
		},
    
    startPoll: function() {
      this.$emit('startPoll');
    }
	}
};