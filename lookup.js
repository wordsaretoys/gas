/**
	loookup tables for narratives and other textual resources
	
	@namespace GAS
	@class lookup
**/

GAS.lookup = {

	ingredient: [
		{ name: "foom", 	desc: "warmth, light, sun, beginning" },
		{ name: "jushu", 	desc: "shadow, cloud, hidden, ending" },
		{ name: "pfft", 	desc: "wind, fate, obstacle, encourage" },
		{ name: "shish",	desc: "descend, question, child" },
		{ name: "blapp",	desc: "soar, bold, grow" },
		{ name: "pist",		desc: "wisdom, shrink, falling" },
		{ name: "woob",		desc: "ancestor, unknown, faraway" },
		{ name: "bish",		desc: "weed, gathering" },
		{ name: "flab",		desc: "sky, world, infinite" }
	],
	
	recipe: [
		{ 
			text: "Weeds reaching for light\nCast strange shadows\nOn the clouds.",
			part: [ "bish", "jushu", "blapp" ]
		},
		{
			text: "A child descends.\nWhere did I come from?\n<i>Who knows?</i> is the only reply.",
			part: [ "shish", "woob", "pist" ]
		},
		{
			text: "Searching for my ancestors\nUntil I age, and tumble into the clouds&mdash;\nFound them.",
			part: [ "woob", "pist", "jushu" ]
		},
		{
			text: "Sun watching me\nWind pushing me\nMe? Just passing the day.",
			part: [ "foom", "pfft", "pist" ]
		},
		{
			text: "In another sky, maybe\nThey have stronger winds\nAnd are wiser for it.",
			part: [ "flab", "pfft", "pist" ]
		},
		{
			text: "Sun and clouds had a fight\nClouds hid, and sun won\nClouds win tomorrow.",
			part: [ "foom", "jushu", "pfft" ]
		},
		{
			text: "I have produced more offspring\nThan there are stars in the sky\nI know none of <i>their</i> names, either.",
			part: [ "shish", "flab", "woob" ]
		},
		{
			text: "Fate gathers us again, my friends\nLounging in the weeds&mdash;\nThe sky will not hold us up forever.",
			part: [ "pfft", "bish", "flab" ]
		},
		{
			text: "We dropped below the clouds\nTo ask if we could live forever.\nToo late, said the clouds.",
			part: [ "shish", "jushu", "flab" ]
		}
	],
	
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
			goal: "talk",
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
			goal: "cook",
			recipe: "stuff",
			solution: []
		},
		
		{
			goal: "talk",
			speech: "more talk"
		}
	],

	player: "hishe",
	npc: [ "old-foosh", "young-foosh", "prapp", "joom" ]
	
};