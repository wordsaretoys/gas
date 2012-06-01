/**
	loookup tables for narratives and other textual resources
	
	@namespace GAS
	@class lookup
**/

GAS.lookup = {

	cast: {
	
		"hishe": {
			name: "Hishe",
			start: {x: 0, y: 0, z: 0},
			skin: {
				coat: "rgb(192, 64, 127)",
				spot: "rgb(64, 192, 255)",
				seed: 12301969
			},
		},
	
		"old-foosh": {
			name: "Old Foosh",
			start: {x: 0, y: 0, z: 0},
			skin: {
				coat: "rgb(255, 127, 0)",
				spot: "rgb(127, 0, 255)",
				seed: 101992382
			}
		},
	
		"young-foosh": {
			name: "Young Foosh",
			start: {x: 0, y: 0, z: 0},
			skin: {
				coat: "rgb(192, 255, 64)",
				spot: "rgb(255, 64, 192)",
				seed: 101992382
			}
		},

		"prapp": {
			name: "Prapp",
			start: {x: 0, y: 0, z: 0},
			skin: {
				coat: "rgb(255, 64, 192)",
				spot: "rgb(127, 255, 64)",
				seed: 7721094
			}
		},

		"joom": {
			name: "Joom",
			start: {x: 0, y: 0, z: 0},
			skin: {
				coat: "rgb(64, 255, 127)",
				spot: "rgb(255, 127, 64)",
				seed: 20572784
			}
		}
		
	},
	
	plot: [
	
		{
			goal: "mono",
			speech: [
				"<div class=\"big\">sargasso</div><div>by Chris Gauthier</div><div><span class=\"key\">W</span> Paddle <span class=\"key\">M1</span> Steer (drag mouse) <span class=\"key\">E</span> Interact",
				"A test, nothing more."
			]
		},
		
		{
			goal: "seek",
			actor: "young-foosh"
		},
		
		{
			goal: "talk",
			speech: "speech go here"
		},
		
		{
			goal: "dance",
			speech: "move around a lot"
		},
		
		{
			goal: "talk",
			speech: "more speech go here"
		},
		
		{
			goal: "end",
			speech: "the end"
		}
	],

	player: "hishe",
	npc: [ "old-foosh", "young-foosh", "prapp", "joom" ]
	
};