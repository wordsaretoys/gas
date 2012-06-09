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
/*
		{
			prose: "<div class=\"small\"><span class=\"key\">W</span> Paddle&nbsp;&nbsp;&nbsp;<span class=\"key\">M1</span> Steer (drag mouse)&nbsp;&nbsp;&nbsp;<span class=\"key\">E</span> Interact</div><br><div class=\"center\"><div class=\"big shiny\">gas food lodging</div><br><div>by Chris Gauthier</div></div><br>"
	
		},

		{
			upset: "joom"
		},

		{
			prose: "Drop and give me twenty.",
			mini: {
				period: 10,
				lbound: [0, 0, 0, 0, 0, 0],
				ubound: [100, 100, 100, 100, 100, 100],
				rating: [ "shit", "sad", "adequate", "okay", "awesome" ]
			},
			lockkeys: true
		},
		
		{
			prose: "can't imagine what that was all about",
			calmed: true,
		},
*/		
		{
		}
		
	],

	player: "hishe",
	npc: [ ]
	
};