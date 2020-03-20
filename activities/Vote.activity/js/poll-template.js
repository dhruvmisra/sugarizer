// Chess component
let PollTemplate = {
	template: `
		<div class="polls-container">
      <div class="poll card">
        
      </div>
		</div>
	`,
	props: ['polls'],
	data: function() {
		return {

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
	mounted: function() {
		let vm = this;
		

		document.getElementsByClassName('popup-bg')[0].addEventListener('click', function() {
			vm.openPopup = false;
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