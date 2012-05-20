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
	
	story: {
		title: "<div class=\"big\">sargasso</div><div>by Chris Gauthier</div><div><span class=\"key\">W</span> Paddle <span class=\"key\">M1</span> Steer (drag mouse) <span class=\"key\">E</span> Interact",
		bolus: "Good! A food bolus. My ingredients are replenished."
	},
	
	errors: {
		cantcook: "I'm lacking some important ingredients. I should seek out a food bolus. They're the whitish clouds scattered throughout the weeds.",
		noneedto: "My stores are already full. I'll just leave this food bolus for another time."
	}

};