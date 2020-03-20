// Chess component
let VotingTemplate = {
	template: `
		<div class="voting-container">
			<div class="card voting-card" v-if="runningPoll != null">
				<div v-if="!submitted">
					<h3 class="py-2">{{ runningPoll ? runningPoll.question : "" }}</h3>
					<div class="options">
						<div v-if="runningPoll ? runningPoll.type == 'YesNo' : false">
							<div class="option" :class="{ selected: selectedOption == 'Yes'}" @click="selectedOption = 'Yes'">Yes</div>
							<div class="option" :class="{ selected: selectedOption == 'No'}" @click="selectedOption = 'No'">No</div>
						</div>
						<div class="input-field" v-else-if="runningPoll ? runningPoll.type == 'Input' : false">
							<input type="text" class="form-control w-100 my-3 px-2" v-model="answerText">	
						</div>
						<div class="option" 
								@click="selectedOption = i" 
								:class="{ selected: selectedOption == i}"
								v-else-if="typeof runningPoll.options != 'undefined'" 
								v-for="(option, i) in runningPoll.options" 
								v-bind:key="option">
							{{ option }}
						</div>
					</div>
					<button class="btn-submit" @click="submit">Submit</button>
				</div>
				<div v-else>
					<div class="smiley-icon"></div>
					<h3>Thank you</h3>
					<p>Waiting for results</p>
				</div>
			</div>

		</div>
	`,
	props: ['runningPoll', 'submitted'],
	data: function () {
		return {
			selectedOption: null,
			answerText: '',
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

	},
	mounted: function () {
		let vm = this;

	},
	methods: {
		localized: function (localization) {
			localization.localize(this.l10n);
		},

		startPoll: function () {
			this.$emit('startPoll');
		},

		submit: function() {
			let answerObj = {};
			switch(this.runningPoll.type) {
				case 'YesNo':
					answerObj.selectedOption = this.selectedOption;
					break;
				case 'MCQ':
					answerObj.selectedOption = this.selectedOption;
					break;
				case 'Input':
					answerObj.answerText = this.answerText;
					break;
			}
			this.$emit('vote-submit', answerObj);
		}
	}
};