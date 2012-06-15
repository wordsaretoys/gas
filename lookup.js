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
				spot: "rgb(0, 64, 127)",
				seed: 12301969
			},
		},
	
		"schabb": {
			name: "Schabb",
			start: {x: 0, y: 0, z: 0},
			skin: {
				coat: "rgb(255, 127, 0)",
				spot: "rgb(127, 0, 255)",
				seed: 2347829
			}
		},
	
		"foosh": {
			name: "Foosh",
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
			fade: { time: 1, alpha: 0 }
		},
	
		{
			prose: "<div class=\"small\"><span class=\"key\">W</span> Paddle&nbsp;&nbsp;&nbsp;<span class=\"key\">M1</span> Steer (drag mouse)&nbsp;&nbsp;&nbsp;<span class=\"key\">E</span> Interact</div><br><div class=\"center\"><div class=\"big shiny\">gas food lodging</div><br><div>by Chris Gauthier</div></div><br>"
		},

		{
			upset: "joom"
		},
		
		{
			prose: "<p>It would be so kind to see your face at my door.</p><p>I wouldn't have to laugh anymore.</p>"
		},

		{
			prose: "<p>Drop and give me twenty.</p>",
			mini: {
				gametime: 2.1,
				ratetime: 1,
				lbound: [0, 0, 0, 0, 0, 0],
				ubound: [100, 100, 100, 100, 100, 100],
				rating: [ "shit", "sad", "adequate", "okay", "awesome" ]
			}
		},
		
		{
			prose: "<p>can't imagine what that was all about.</p>"
		},

		{
			fade: { time: 0, alpha: 1 },
			calmed: true,
			prose: "<br><div class=\"center big shiny\">bump!</div>"
		},
		
		{
			warp: "joom",
			fade: { time: 1, alpha: 0 }
		},
		
		{
		}
		
	],

	player: "hishe",
	npc: [ "joom" ]
	
};