// Toolbar item
var ToolbarItem = {
	template: `
		<div class="splitbar" v-if="isSplitbar"/>
		<button v-on:click="onClick()" v-bind:id="id" v-bind:title="title" :disabled="isDisabled" v-bind:class="computeClass()" v-else/>
	`,
	props: ['id', 'title', 'isSplitbar', 'toRight', 'paletteClass', 'paletteFile', 'paletteEvent', 'disabled', 'active'],
	data: function () {
		return {
			isDisabled: (this.disabled !== undefined),
			isActive: (this.active !== undefined),
			paletteObject: null
		}
	},
	methods: {
		onClick: function () {
			this.$emit('clicked');
		},

		computeClass: function () {
			return (this.toRight ? 'toolbutton pull-right' : 'toolbutton') + (this.isActive ? ' active' : '');
		}
	},

	mounted: function () {
		// Create palette if present
		var vm = this;
		if (vm.id && vm.paletteClass && vm.paletteFile) {
			requirejs([vm.paletteFile], function (palette) {
				vm.paletteObject = new palette[vm.paletteClass](document.getElementById(vm.id));
				if (vm.paletteEvent) {
					vm.paletteObject.addEventListener(vm.paletteEvent, function (event) {
						vm.$emit(vm.paletteEvent, event);
					});
				}
			});
		}
	}
}

// Toolbar component
var Toolbar = {
	components: { 'toolbar-item': ToolbarItem },
	template: `
		<div id="main-toolbar" class="toolbar">
			<toolbar-item id="activity-button" v-bind:title="l10n.stringChessActivity"></toolbar-item>
			<toolbar-item isSplitbar="true"></toolbar-item>
			
			<toolbar-item ref="settingsBtn" id="settings-button" v-if="!settingsMode" v-on:clicked="getApp().switchSettings()" v-bind:title="l10n.stringSettings"></toolbar-item>
			<toolbar-item ref="playBtn" id="play-button" v-if="settingsMode" v-on:clicked="getApp().switchSettings()" v-bind:title="l10n.stringPlay"></toolbar-item>
			<toolbar-item ref="addBtn" id="add-button" v-if="settingsMode" v-on:clicked="" v-bind:title="l10n.stringAdd"></toolbar-item>
			<toolbar-item isSplitbar="true"></toolbar-item>
			<toolbar-item ref="networkBtn" id="network-button" v-bind:title="l10n.stringNetwork"></toolbar-item>

			<toolbar-item v-on:clicked="getApp().onStop()" id="stop-button" title="Stop" toRight="true"></toolbar-item>
			<toolbar-item ref="fullscreen" v-on:clicked="getApp().fullscreen()" id="fullscreen-button" v-bind:title="l10n.stringFullscreen" toRight="true"></toolbar-item>
			<toolbar-item v-on:clicked="getApp().onHelp('ui')" id="help-ui-button" v-bind:title="l10n.stringHelp" toRight="true"></toolbar-item>
		</div>
	`,
	props: ['statsOpen', 'settingsMode'],
	data: function () {
		return {
			l10n: {
				stringChessActivity: '',
				stringTemplate: '',
				stringRestart: '',
				stringHelp: '',
				stringSettings: '',
				stringFullscreen: '',
				stringNetwork: '',
				stringDifficulty: '',
				stringRules: '',
			}
		}
	},
	methods: {
		localized: function (localization) {
			localization.localize(this.l10n);
		},

		getApp: function () {
			return app;
		}
	}
}
