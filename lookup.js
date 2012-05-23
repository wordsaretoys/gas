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
	
	/** NOTE: ADD HINTS TO EACH **/
	
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
	
	character: {
	
		"player": {
			model: {
				coat: "rgb(255, 0, 0)",
				spot: "rgb(0, 255, 0)",
				seed: 12301969,
				position: {x: 0, y: 0, z: 0}
			},
			story: {
				needstores: "I'm lacking some important ingredients. I should seek out a food bolus. They're the whitish clouds scattered throughout the weeds."
			}
		},
	
		"npc-foosh": {
			name: "Foosh",
			type: "npc",
			model: {
				coat: "rgb(255, 255, 0)",
				spot: "rgb(0, 0, 255)",
				seed: 101,
				position: {x: 0, y: 0, z: -5}
			},
			story: {
				intro: [
					"The first person I catch up to can't even speak, e's panicking so hard.<br>Well, every chef knows that food calms people down, gets them talking.<br>\"What's your favorite dish?\" I ask, and Frapp blurts it out.",
					"\"Weeds reaching for light&mdash;&nbsp;Cast strange shadows&mdash;&nbsp;On the clouds.\"<br>That's the recipe. Every dish tells a story.<br>All I have to do is work out the ingredients."
				],
				recipe: "Weeds reaching for light&mdash;<br>Cast strange shadows&mdash;<br>On the clouds.",
				failure: "Foosh finishes the dish and mutters something kind.<br>E's too polite to tell me I blew it, but I can see em twitching.<br>I'll have to try again. First, I need to locate more ingredients.",
				success: "\"Oh,\" says Foosh, \"that was excellent!\" I can already see em calming down.<br>E's been feeling a strange presence&mdash;in e's <i>mind</i>. Like something crawled inside to poke around.<br>I can't imagine what it might be, but I'm glad I could help."
			},
			solve: [ "bish", "jushu", "blapp", "foom" ]
		},
	
		"npc-prapp": {
			name: "Prapp",
			type: "npc",
			model: {
				coat: "rgb(255, 255, 0)",
				spot: "rgb(0, 0, 255)",
				seed: 101,
				position: {x: 0, y: 0, z: -5}
			},
			story: {
			}
		}
	
	},
	
	plot: [
	
		[ "npc-foosh" ]
	
	],
	
	title: "<div class=\"big\">sargasso</div><div>by Chris Gauthier</div><div><span class=\"key\">W</span> Paddle <span class=\"key\">M1</span> Steer (drag mouse) <span class=\"key\">E</span> Interact"
};