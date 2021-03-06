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
			start: {x: 200, y: 0, z: 0},
			skin: {
				coat: "rgb(255, 127, 0)",
				spot: "rgb(127, 0, 255)",
				seed: 2347829
			}
		},
	
		"foosh": {
			name: "Foosh",
			start: {x: 0, y: 0, z: -200},
			skin: {
				coat: "rgb(192, 255, 64)",
				spot: "rgb(255, 64, 192)",
				seed: 101992382
			}
		},

		"prapp": {
			name: "Prapp",
			start: {x: -200, y: 0, z: 0},
			skin: {
				coat: "rgb(255, 64, 192)",
				spot: "rgb(127, 255, 64)",
				seed: 7721094
			}
		},

		"joom": {
			name: "Joom",
			start: {x: 0, y: 0, z: 200},
			skin: {
				coat: "rgb(64, 255, 127)",
				spot: "rgb(255, 127, 64)",
				seed: 20572784
			}
		}
		
	},
	
	plot: [
//0
		{
			fade: { time: 1, alpha: 0 }
		},
	
		{
			prose: "<div class=\"small\"><span class=\"key\">W</span> Paddle&nbsp;&nbsp;&nbsp;<span class=\"key\">F</span> Fullscreen OR <span class=\"key\">M1</span> Steer (drag mouse)&nbsp;&nbsp;&nbsp;<span class=\"key\">E</span> Interact</div><br><div class=\"center\"><div class=\"big shiny\">gas food lodging</div><br><div>by Chris Gauthier</div></div><br>"
		},

		{
			prose: "<p><i>Hische, Hische!</i> I used to like my name, until I heard it shouted a hundred times.</p><p><i>Hische, Hische!</i> You wouldn't think a hotel in the backwinds of Low Cloud would get many guests, and you'd be right. Peace of mind comes in numbers. When I have lots of guests, they bother each other. When I don't, they bother me.</p><p><i>Hische, Hische!</i> Better go see what this one wants.</p>"
		},

		{
			shout: "foosh"
		},
		
		{
			prose: "<p>Foosh and Schabb are traveling together. Schabb's not around at the moment. Young Foosh wants to eat, and e's young enough to ask if I'm in the mood to cook.</p><p>\"Of course. Will Schabb be joining us?\" I ask, but the elder has gone to meditate. Sounds like fun. One house special, coming up.</p>"
		},
//5		
		{
			mini: {
				help: "<p>Cooking involves blending the foodstocks in your internal pouches with denaturing agents.</p><p>Sweep back and forth in short strokes until you fill the progress bar.</p>",
				total: 5,
				graph: {
					xn: 0.5,
					xp: 0.5,
					yn: 0,
					yp: 0
				}
			}
		},
		
		{
			prose: "<p>\"What was in that?\" Foosh wants to know. Recipes are like stories. The best make you guess at what the hell went into them.</p><p>Foosh likes this. \"You sound like old Schabb. E's helping me find my parent, you know.\"</p><p>I didn't know. I don't like it. I'm respectful, but I still want to know who implied Schabb could do this. \"Oh, <i>e</i> did. Schabb's an expert in these things.\" I'd share a little expertise of my own, but the guest is always right, and another one is calling me.</p>"
		},
		
		{
			release: true,
			wander: "foosh",
			shout: "joom"
		},
		
		{
			prose: "<p>\"Bump em,\" says Joom as I glide up. Odd to hear the chant outside of a bumpers arena, but a three-time champion of the Low Cloud Park Bouncers can say hello any way e wants to.</p><p>(<i>Bumpers</i>: team game played by sneaking up on rival players and ramming them. A sharp jolt to the anterior nerve cluster will put a player out for hours. Matches are won by attrition.)</p><p>Joom's being traded to the Weed Range Bangers. \"Good team,\" e says, without enthusiasm. When I ask if e's looking forward to the new season, the answer is succinct. \"No.\"</p><p>Then, e asks me for a dance.</p>"
		},
		
		{
			mini: {
				help: "<p>When entertaining a guest, a simple dance is sufficient.</p><p>Spin to the left. After each complete revolution, bob up and down.</p>",
				total: 5,
				graph: {
					xn: 0.6,
					xp: 0,
					yn: 0.2,
					yp: 0.2
				}
			}
		},
// 10		
		{
			prose: "<p>Joom asks me if I bump at all. I'd love a one-on-one with a champion, but I'm working. \"Foosh might be game,\" I say, thinking Joom would be a better companion than the one e's got at the moment. Might even knock some sense into em.</p><p>Not that I involve myself with guests, of course. \"Sweet,\" says Joom, setting off. \"Bump em.\"</p>"
		},
		
		{
			release: true,
			wander: "joom",
			shout: "prapp"
		},
		
		{
			prose: "<p>\"The undercloud holds the future of our species,\" Prapp tells me right off. I look around to see who e's addressing. \"Fantastic pressures and absolute darkness. I had to learn how to deflate myself.\"</p><p>I point out that this sounds like a useful skill, but Prapp keeps going. \"I find my way by sensing air currents. Storms raging since before recorded time&mdash;\"</p><p>\"Sorry, did you want something?\" I have to ask.</p><p>\"I'm practicing a lecture,\" e says, \"Just listen and nod your head once in a while, hm?\"</p>"
		},
		
		{
			mini: {
				help: "<p>Feign interest to make your guest feel comfortable.</p><p>Bob up and down. Avoid moving to the side.</p>",
				total: 2,
				graph: {
					xn: 0,
					xp: 0,
					yn: 0.5,
					yp: 0.5
				}
			}
		},
		
		{
			prose: "<p>\"&mdash;could be formidable. Well, dear Hische,\" Prapp says at last, \"I seem to be talked out.\" I'm a little lost for words myself. \"By the way, I'm looking for an expedition partner.\"</p><p>\"I'll pass that along,\" I say, hoping I don't come off too rudely. Joom wouldn't be interested and Schabb is busy conning young Foosh, who might be a little <i>too</i> young for this&mdash;</p><p>\"What about you?\" says Prapp. <i>Me?</i> It's scary down there in the undercloud. Anyhow, I have a hotel to run, and someone else is calling for me.</p><p>I'd yell back, but sneaking up on them is more fun.</p>"
		},
// 15		
		{
			release: true,
			wander: "prapp",
			shout: "joom"
		},
		
		{
			prose: "<p>Joom's all fired up. \"Foosh is looking for e's parent. Isn't that <i>amazing</i>? I wish em all the luck.\" I mutter something about exactly how much luck young Foosh is going to need&mdash;we begin life as spores and the wind blows us where it will. Joom ignores me. \"I wish I'd known my parent.\"</p><p>E's <i>serious</i>. Personally, I've never cared whose arse I flew out of. But Joom cares. \"I could've had some guidance in life, Hische.\" Really? The life of a pro bumpers player? \"It's going stale. Trades and options. I love the challenge of the game.\"</p><p>I make a suggestion that doesn't go over very well.</p><p>\"<i>Coach?</i> I'm bored, not old. I'll show you a coach. <i>Pattern drill!</i>\"</p>"
		},
		
		{
			mini: {
				help: "<p>Oops! You played the game as a kid, but you're rusty.</p><p>The classic bumpers pattern involves ducking under an opponent, then striking upward.</p><p>Trace along the shape of a fishhook, back and forth.</p>",
				total: 5,
				graph: {
					xn: 0.1,
					xp: 0.1,
					yn: 0.4,
					yp: 0.4
				}
			}
		},
		
		{
			prose: "<p>\"Mm,\" says Joom after I've run through my moves, \"I bet you're a good cook.\" High praise. I'm still feeling bad about my earlier suggestion, though.</p><p>\"If you're really bored with bumpers,\" I say, \"there are options. Like&mdash;well, there's Prapp, going to explore the undercloud, needs a partner&mdash;\"</p><p>\"And if I could bash the undercloud in the head,\" says Joom, \"that would mean something.\"</p>"
		},
		
		{
			release: true,
			wander: "joom",
			shout: "schabb"
		},
// 20
		{
			prose: "<p>Well, well. \"I've heard good things about you,\" says Schabb, and I wish I could say the same&mdash;but the guest is always right. Nod. Smile.</p><p>\"Travel makes me hungry.\" Yeah, moving a lot and using up calories tends to do that. \"I'd like something <i>off</i> the menu, if you don't mind.\"</p><p>Well, the menu exists for a reason, but I've got foodstocks stashed away for requests like this.</p>"
		},
		
		{
			mini: {
				help: "<p>Going off-menu means tapping seldom used foodstocks in your back pouches.</p><p>As before, shake back and forth, but add regular head-bobs on each stroke.</p>",
				total: 5,
				graph: {
					xn: 0.35,
					xp: 0.35,
					yn: 0.15,
					yp: 0.15
				}
			}
		},
		
		{
			prose: "<p>\"Bit heavy on the woom,\" says Schabb, and when I explain that there's no woom in it, dodges the gaffe as well as anyone I've ever met. \"Oh, I didn't say it wasn't well-prepared. Foosh tells me there's a bumpers champion staying with you.\"</p><p>I tell him this is so. \"Good, good. Anyone else?\" As I explain about Prapp, I realize this gasbag is pumping me for information. Potential marks, that sort of thing. I cut it short.</p><p>\"No one else,\" I say, and as e swims away I think I hear em mutter, <i>except you, of course</i>.</p>"
		},

		{
			release: true,
			wander: "schabb",
			shout: "foosh"
		},
		
		{
			prose: "<p>Looking ragged, Foosh asks for a dance. \"I need to calm down,\" e says, \"after that match with Joom.\" I'm happy to oblige, but I'm becoming concerned about Shabb's influence&mdash;not that I'd challenge a guest. Nothing says I can't ask questions, though.</p><p>\"How will Schabb find your parent?\" I ask, and young Foosh stumbles through an explanation of how spore propagation can be recapitulated through matching spot patterns in a population sample. It sounds like words in a windstorm. I'm not sure if Foosh understands it.</p><p>So, I ask em to explain it so <i>I</i> can understand it. That doesn't please em at all. \"Less talking,\" e says, \"and more dancing, caretaker.\"</p>"
		},
// 25
		{
			mini: {
				help: "<p>Uh oh. A simple dance won't cut it this time.</p><p>Move back and forth, sweeping up and down at the end of each stroke, in a U-shape.</p>",
				total: 10,
				graph: {
					xn: 0.15,
					xp: 0.15,
					yn: 0.35,
					yp: 0.35
				}
			}
		},
		
		{
			prose: "<p>I do my best to make Foosh happy, but either there's still some hard feelings there, or maybe, just <i>maybe</i>, the weeds of doubt are working their way through the clouds. Might as well see if it's one or the other.</p><p>\"So,\" I say, \"this spore propagation thing&mdash;\"</p><p>E cuts me off. \"None of your business. And don't bring up the subject again.\"</p><p>Well, that's me told. Can't help but wonder why e brought it up with me in the first place.</p>"
		},
		
		{
			release: true,
			wander: "foosh",
			shout: "prapp"
		},
		
		{
			prose: "<p>\"You look glum,\" says Prapp, as I glide up to find out what the hell e wants. I want to dismiss it as a minor dispute with a guest, but I pride myself on not having such things, and I'm smarting from Foosh's abuse. So, I wind up babbling the whole thing.</p><p>Prapp roars with laughter at the description of Schabb's methodology. \"Fortunetelling,\" e says, though when I ask if finding one's parent is impossible, e softens. \"Finding is possible. Anyone could be the parent of anyone else. <i>Knowing</i> is impossible.\"</p><p>I'm pleased to have my suspicions confirmed. However, I've embarrassed myself with all this. \"Thank you,\" I say, \"now, how can I help?\" and all he wants is another captive audience.</p>"
		},

		{
			mini: {
				help: "<p>As you've gotten to know Prapp, a little dissent is fine.</p><p>Nod, but punctuate every few nods with a shake back and forth.</p>",
				total: 8,
				graph: {
					xn: 0.15,
					xp: 0.15,
					yn: 0.35,
					yp: 0.35
				}
			}
		},
// 30
		{
			prose: "<p>It's the same lecture as before. A few changes. \"I've filed off the rough bits, I think,\" e says. \"In the case of young Foosh, don't hesitate to quote me if you need an authority.\"</p><p>I'm not looking for an argument, but it's good to hear I have an ally if I need one.</p>"
		},
		
		{
			release: true,
			wander: "prapp",
			descend: "foosh",
			shout: "joom"
		},
		
		{
			prose: "<p>Joom's in a foul mood. \"What kind of place <i>is</i> this? You go around mocking people for trying to better themselves?\" I try to point out that this isn't that kind of place, and that e's word choice means e might have internalized Foosh's situation just a <i>tiny</i> bit, and if e calms down I'll try to rectify the situation any way I can.</p><p>All I actually manage to say is \"Um.\"</p><p>\"Foosh came to see me,\" e says, which I'd already guessed. \"Poor kid's all freaked out. What gives you the right to question em? Leave people alone.\"</p>"
		},

		{
			prose: "<p>You know how everything can go catastrophically wrong in an instant?</p><p>As I stumble over an explanation, it occurs to me that Joom isn't in posession of all the facts, and I've just <i>got</i> to explain that my suspicion of Schabb is based on actual scientific information, which has been kindly confirmed by Prapp, our own resident scholar&mdash;</p><p>And everything goes catastrophically wrong in an instant.</p>"
		},
		
		{
			bump: "joom"
		},
// 35
		{
			shout: "joom",
			fade: { time: 0, alpha: 1 },
			prose: "<br><div class=\"center big shiny\">bump em</div><br>"
		},

		{
			swap: [ "joom", "schabb" ],
			fade: { time: 2.5, alpha: 0 }
		},
		
		{
			prose: "<p>\"Oh, Hische,\" says the person I least want to see as I'm recovering from a bumping, \"what a mess you've made.\" I can barely talk, much less argue, so Schabb is free to tell me what's been going on.</p><p>It's worse than I could imagine. Foosh has vanished, possibly into the undercloud. Prapp has gone to look for em. And Joom is sulking in the weeds, too upset to do anything.</p><p>\"I must say,\" says Schabb, \"I expected better from such a highly rated establishment.\"</p>"
		},
		
		{
			release: true,
			wander: "schabb",
			shout: "joom"
		},
		
		{
			prose: "<p>\"Sorry.\" It's the first word out of Joom's mouth, and it's a good start, but it's not going anyplace helpful. \"I'm being traded for bumping a spectator. I want out, but what else can I do? Maybe if I keep messing up, they'll fire me for good.\"</p><p>Fantastic. I have a guest lost in the undercloud and a potential rescuer lost in self-pity. \"Foosh could really use your help right now.\"</p><p>\"Prapp's looking for the kid,\" says Joom. \"I chased that old gasbag all over the weeds after I bumped you and couldn't get close to em once. How's e <i>do</i> that?\" There's admiration in e's voice.</p><p>\"Air currents.\" No time. I have to get Joom motivated and there's only one way I know to do it.</p>"
		},
// 40
		{
			mini: {
				help: "<p>Do the bumper chant! Spin right, lifting your head, then dropping it, then raising it.</p><p>Don't move left or let your head get too high or too low.</p>",
				total: 8,
				graph: {
					xn: 0,
					xp: 0.33,
					yn: 0.33,
					yp: 0.33
				}
			}
		},

		{
			prose: "<p>I'm not sure what puzzles Joom more: the chant, or the dawning idea that e might be of use to someone. \"You really think I could help?\" e says.</p><p>\"Find Prapp. Let em make the call.\"</p><p>\"Right.\" E takes a decisive turn. \"Thanks, coach.\" Ha, ha. As <i>if</i>.</p>"
		},
		
		{
			release: true,
			descend: "joom",
			prose: "<p>All I can do now is wait. Well, I suppose I could go see if Schabb needs anything&mdash;no. All I can do now is wait. Yeah, that's all I can do. Just wait.</p>"
		},
		
		{
			fade: { time: 1, alpha: 1 }
		},
		
		{
			home: "foosh",
			fade: { time: 1, alpha: 0 }
		},
		
		{
			shout: "foosh"
		},
// 45
		{
			prose: "<p>Seems to be a day for apologies. \"Prapp and Joom found me in the undercloud,\" says Foosh. \"I'm sorry I caused you all so much trouble.\" And the whole story tumbles out.</p><p>E's been having doubts for some time now, but the promises kept coming, and the debts kept growing. \"Once you go so deep, how do you admit you've make a mistake?\"</p><p>In fact, the reason e mentioned it to me in the first place was to get my reaction&mdash;but when I all but confirmed what e feared, e couldn't handle it. \"Prapp talked sense. I'm not liable for debts accrued to a con. All I've lost is time and respectability. The second, at least, I can get back.\"</p><p>Then e thanks me, and departs for home.</p>"
		},

		{
			release: true,
			exit: "foosh",
			shout: "schabb"
		},
		
		{
			prose: "<p>Schabb can't quite believe e's lost. \"Is <i>this</i> how you treat a guest?\" e demands.</p><p>I think about it. \"No,\" I say at last, \"you're right, it isn't. So get out.\"</p>"
		},
		
		{
			release: true,
			descend: "schabb",
			shout: "prapp"
		},
		
		{
			prose: "<p>\"Just wanted to say thank you,\" says Prapp, \"for a lovely stay. And for finding me a partner, of course. Joom's practicing my deflation exercises for deep descent. E sends regards.\"</p><p>I'm not completely surprised, though a little sad, for reasons I don't quite understand. \"I guess Joom found the guidance e was looking for.\"</p><p>\"Perhaps.\" Prapp smiles. \"I'll take good care of my wayward child.\" E catches my look. \"Figure of speech, dear Hische. Figure of speech.\"</p>"
		},
// 50		
		{
			exit: "prapp",
			stop: "<br><div class=\"center big shiny\">the end</div><br>"
		},

		{
		}
		
	],

	player: "hishe",
	npc: [ "joom", "prapp", "foosh", "schabb" ]
	
};