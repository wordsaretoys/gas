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
/*
		{
			fade: { time: 1, alpha: 0 }
		},
	
		{
			prose: "<div class=\"small\"><span class=\"key\">W</span> Paddle&nbsp;&nbsp;&nbsp;<span class=\"key\">M1</span> Steer (drag mouse)&nbsp;&nbsp;&nbsp;<span class=\"key\">E</span> Interact</div><br><div class=\"center\"><div class=\"big shiny\">gas food lodging</div><br><div>by Chris Gauthier</div></div><br>"
		},
*/
		{
			fade: { time: 1, alpha: 0 }
		},

		{
			upset: "joom"
		},
		
		{
			prose: "<p>hey, here's a thing</p>"
		},
		
		{
			mini: {
				help: "<p>Cooking!</p>",
				total: 5,
				graph: {
					xn: 0.1,
					xp: 0.1,
					yn: 0.4,
					yp: 0.4
				}
			}
		},
/*		
		{
			prose: "<p>can't imagine what that was all about.</p>"
		},

		{
			fade: { time: 0, alpha: 1 },
			prose: "<br><div class=\"center big shiny\">bump!</div>"
		},
		
		{
			swap: [ "joom", "schabb" ],
			fade: { time: 1, alpha: 0 }
		},
		
		{
			prose: "<p>ha, you fucked up</p>"
		},
		
		{
			calmed: true
		},
*/		
		{
		}
		
	],

	player: "hishe",
	npc: [ "joom" ]
	
};