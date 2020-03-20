// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

// Vue main app
let app = new Vue({
	el: '#app',
	components: {
		'toolbar': Toolbar, 'localization': Localization, 'tutorial': Tutorial, 'poll-template': PollTemplate,
		'voting-template': VotingTemplate, 'stats-template': StatsTemplate
	},
	data: {
		currentUser: {
			colorvalue: {
				stroke: "#000000",
				fill: "#000000"
			}
		},
		isHost: false,
		presence: null,
		palette: null,
		humane: null,
		shared: false,
		polls: [
			{
				id: 0,
				type: 'YesNo',
				question: 'Have you completed the assignment?'
			},
			{
				id: 1,
				type: 'Input',
				question: 'What are your ideas?'
			},
			{
				id: 2,
				type: 'MCQ',
				question: 'Have you made any progress?',
				answer: 0,
				options: [
					'Yes a lot',
					'Yes, a little',
					'Not much',
					'Not at all'
				]
			},
		],
		runningPoll: null,
		answers: [],
		submitted: false,
		statsOpen: false,
		settingsMode: false,
		tutorialRunning: false
	},


	created: function () {
		requirejs(["sugar-web/activity/activity", "sugar-web/env"], function (activity, env) {
			// Initialize Sugarizer
			activity.setup();
		});
	},

	mounted: function () {
		// Load last library from Journal
		var vm = this;
		requirejs(["sugar-web/activity/activity", "sugar-web/env", "sugar-web/graphics/presencepalette", "humane"], function (activity, env, presencepalette, humane) {
			env.getEnvironment(function (err, environment) {

				env.getEnvironment(function (err, environment) {
					vm.currentUser = environment.user;
					document.getElementById('canvas').style.background = environment.user.colorvalue.fill;
				});

				// Load context
				if (environment.objectId) {
					activity.getDatastoreObject().loadAsText(function (error, metadata, data) {
						if (error == null && data != null) {
							let context = JSON.parse(data);
							vm.currentpgn = context.gamePGN;
						} else {
							console.log("Error loading from journal");
						}
					});
				}

				// Shared instances
				if (environment.sharedId) {
					console.log("Shared instance");
					vm.presence = activity.getPresenceObject(function (error, network) {
						if (error) {
							console.log(error);
						}
						vm.shared = true;
						network.onDataReceived(vm.onNetworkDataReceived);
						network.onSharedActivityUserChanged(vm.onNetworkUserChanged);
					});
				}
			});

			vm.humane = humane;

			vm.palette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);
			vm.palette.addEventListener('shared', function () {
				vm.palette.popDown();
				console.log("Want to share");
				vm.presence = activity.getPresenceObject(function (error, network) {
					if (error) {
						console.log("Sharing error");
						return;
					}
					network.createSharedActivity('org.sugarlabs.Vote', function (groupId) {
						console.log("Activity shared");
						vm.isHost = true;
						vm.shared = true;
					});
					network.onDataReceived(vm.onNetworkDataReceived);
					network.onSharedActivityUserChanged(vm.onNetworkUserChanged);
				});
			});
		});

		// Handle unfull screen buttons (b)
		document.getElementById("unfullscreen-button").addEventListener('click', function () {
			vm.unfullscreen();
		});
	},

	methods: {

		localized: function () {
			this.$refs.toolbar.localized(this.$refs.localization);
			this.$refs.tutorial.localized(this.$refs.localization);
		},

		// Handle fullscreen mode
		fullscreen: function () {
			var vm = this;
			document.getElementById("main-toolbar").style.opacity = 0;
			document.getElementById("canvas").style.top = "0px";
			document.getElementById("unfullscreen-button").style.visibility = "visible";
		},
		unfullscreen: function () {
			var vm = this;
			document.getElementById("main-toolbar").style.opacity = 1;
			document.getElementById("canvas").style.top = "55px";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
		},

		startPoll: function(id) {
			let vm = this;
			this.runningPoll = this.polls.find(e => e.id == id);
			if(!this.shared) {
				let event = document.createEvent("CustomEvent");
				event.initCustomEvent('shared', true, true, {});
				this.palette.getPalette().dispatchEvent(event);
			} else {
				this.presence.sendMessage(this.presence.getSharedInfo().id, {
					user: vm.presence.getUserInfo(),
					content: {
						action: 'startPoll',
						poll: vm.runningPoll
					}
				});
			}
		},

		stopPoll: function() {
			this.runningPoll = null;
			this.statsOpen = false;
			this.answers = [];
			this.submitted = false;
		},

		switchSettings: function() {
			this.settingsMode = !this.settingsMode;
		},

		switchStats: function() {
			this.statsOpen = !this.statsOpen;
		},

		closeStats: function() {
			this.statsOpen = false;
		},

		colourize: function(colors) {
			// requirejs(["sugar-web/graphics/icon"], function(icon) {
			// 	let img = new Image()
			// 	img.onload = function() {
			// 		icon.colorize(this, colors);
			// 		console.log()
			// 	}
			// 	img.src = './icons/owner-icon.svg';
			// });

		},

		voteSubmit: function(answer) {
			let vm = this;
			this.presence.sendMessage(this.presence.getSharedInfo().id, {
				user: vm.presence.getUserInfo(),
				content: {
					action: 'vote',
					answer: answer
				}
			});
			this.submitted = true;
		},

		onMove: function (move) {
			if (this.opponent && this.presence) {
				this.presence.sendMessage(this.presence.getSharedInfo().id, {
					user: this.presence.getUserInfo(),
					content: {
						action: 'move',
						move: {
							from: move.from,
							to: move.to
						}
					}
				});
			}
		},

		onHelp: function (type) {
			if(type == 'rules') {
				this.tutorialRunning = true;
			}
			this.$refs.tutorial.show(type);
		},

		onHelpEnd: function(type) {
			if(type == 'ui') {
				this.$refs.tutorial.show('rules');
				this.tutorialRunning = true;
			} else {
				this.tutorialRunning = false;
			}
		},

		onNetworkDataReceived: function (msg) {
			if (this.presence.getUserInfo().networkId === msg.user.networkId) {
				return;
			}
			console.log(msg.content)
			switch (msg.content.action) {
				case 'init':
					this.runningPoll = msg.content.poll;
					break;
				case 'startPoll':
					this.runningPoll = msg.content.poll;
					this.submitted = false;
					break;
				case 'vote':
					this.answers.push({
						user: msg.user,
						answer: msg.content.answer
					});
					break;
				case 'switchStats':
					this.statsOpen = msg.content.statsOpen;
					break;

			}
		},

		onNetworkUserChanged: function (msg) {
			let vm = this;

			// If user joins
			if (msg.move == 1) {
				// Handling only by the host
				if (this.isHost) {
					// this.opponent = msg.user.networkId;
					// this.opponentColors = msg.user.colorvalue;
					this.presence.sendMessage(this.presence.getSharedInfo().id, {
						user: vm.presence.getUserInfo(),
						content: {
							action: 'init',
							poll: vm.runningPoll
						}
					});
				}
			}
			// If user leaves
			else {
				console.log('user left');
			}

			console.log("User " + msg.user.name + " " + (msg.move == 1 ? "joined" : "left"));
			if (this.presence.getUserInfo().networkId !== msg.user.networkId) {
				this.humane.log("User " + msg.user.name + " " + (msg.move == 1 ? "joined" : "left"));
			}
		},

		onStop: function () {
			// Save current library in Journal on Stop
			var vm = this;
			requirejs(["sugar-web/activity/activity"], function (activity) {
				console.log("writing...");

				let context = {
					gamePGN: vm.$refs.chesstemplate.game.pgn()
				};
				var jsonData = JSON.stringify(context);
				activity.getDatastoreObject().setDataAsText(jsonData);
				activity.getDatastoreObject().save(function (error) {
					if (error === null) {
						console.log("write done.");
					} else {
						console.log("write failed.");
					}
				});
			});
		}
	}
});
