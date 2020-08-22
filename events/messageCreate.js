'use strict';

let swears = /\b(4r5e|5h1t|5hit|a55|anal|anus|ar5e|arrse|arse|ass|ass-fucker|asses|assfucker|assfukka|asshole|assholes|asswhole|a_s_s|b!tch|b00bs|b17ch|b1tch|ballbag|balls|ballsack|bastard|beastial|beastiality|bellend|bestial|bestiality|bi\+ch|biatch|bitch|bitcher|bitchers|bitches|bitchin|bitching|bloody|blow job|blowjob|blowjobs|boiolas|bollock|bollok|boner|boob|boobs|booobs|boooobs|booooobs|booooooobs|breasts|buceta|bugger|bum|bunny fucker|butt|butthole|buttmuch|buttplug|c0ck|c0cksucker|carpet muncher|cawk|chink|cipa|cl1t|clit|clitoris|clits|cnut|cock|cock-sucker|cockface|cockhead|cockmunch|cockmuncher|cocks|cocksuck|cocksucked|cocksucker|cocksucking|cocksucks|cocksuka|cocksukka|cok|cokmuncher|coksucka|coon|cox|crap|cum|cummer|cumming|cums|cumshot|cunilingus|cunillingus|cunnilingus|cunt|cuntlick|cuntlicker|cuntlicking|cunts|cyalis|cyberfuc|cyberfuck|cyberfucked|cyberfucker|cyberfuckers|cyberfucking|d1ck|damn|dick|dickhead|dildo|dildos|dink|dinks|dirsa|dlck|dog-fucker|dog fucker|doggin|dogging|donkeyribber|doosh|duche|dyke|ejaculate|ejaculated|ejaculates|ejaculating|ejaculatings|ejaculation|ejakulate|f u c k|f u c k e r|f4nny|fag|fagging|faggitt|faggot|faggs|fagot|fagots|fags|fanny|fannyflaps|fannyfucker|fanyy|fatass|fcuk|fcuker|fcuking|feck|fecker|felching|fellate|fellatio|fingerfuck|fingerfucked|fingerfucker|fingerfuckers|fingerfucking|fingerfucks|fistfuck|fistfucked|fistfucker|fistfuckers|fistfucking|fistfuckings|fistfucks|flange|fook|fooker|fuck|fucka|fucked|fucker|fuckers|fuckhead|fuckheads|fuckin|fucking|fuckings|fuckingshitmotherfucker|fuckme |fucks|fuckwhit|fuckwit|fudge packer|fudgepacker|fuk|fuker|fukker|fukkin|fuks|fukwhit|fukwit|fux|fux0r|f_u_c_k|gangbang|gangbanged |gangbangs |gaylord|gaysex|goatse|god-dam|god-damned|goddamn|goddamned|hardcoresex |hell|heshe|hoar|hoare|hoer|homo|hore|horniest|horny|hotsex|jack-off |jackoff|jap|jerk-off |jism|jiz |jizm |jizz|kawk|knob|knobead|knobed|knobend|knobhead|knobjocky|knobjokey|kock|kondum|kondums|kum|kummer|kumming|kums|kunilingus|l3i\+ch|l3itch|labia|lmfao|lust|lusting|m0f0|m0fo|m45terbate|ma5terb8|ma5terbate|masochist|master-bate|masterb8|masterbat*|masterbat3|masterbate|masterbation|masterbations|masturbate|mo-fo|mof0|mofo|mothafuck|mothafucka|mothafuckas|mothafuckaz|mothafucked |mothafucker|mothafuckers|mothafuckin|mothafucking |mothafuckings|mothafucks|mother fucker|motherfuck|motherfucked|motherfucker|motherfuckers|motherfuckin|motherfucking|motherfuckings|motherfuckka|motherfucks|muff|mutha|muthafecker|muthafuckker|muther|mutherfucker|n1gga|n1gger|nazi|nigg3r|nigg4h|nigga|niggah|niggas|niggaz|nigger|niggers |nob|nob jokey|nobhead|nobjocky|nobjokey|numbnuts|nutsack|orgasim |orgasims |orgasm|orgasms |p0rn|pawn|pecker|penis|penisfucker|phonesex|phuck|phuk|phuked|phuking|phukked|phukking|phuks|phuq|pigfucker|pimpis|piss|pissed|pisser|pissers|pisses |pissflaps|pissin|pissing|pissoff|porn|porno|pornography|pornos|prick|pricks|pron|pube|pusse|pussi|pussies|pussy|pussys|retard|rimjaw|rimming|s hit|s.o.b.|sadist|schlong|screwing|scroat|scrote|scrotum|semen|sex|sh!\+|sh!t|sh1t|shag|shagger|shaggin|shagging|shemale|shi\+|shit|shitdick|shite|shited|shitey|shitfuck|shitfull|shithead|shiting|shitings|shits|shitted|shitter|shitters |shitting|shittings|shitty |skank|slut|sluts|smegma|smut|snatch|son-of-a-bitch|spac|spunk|s_h_i_t|t1tt1e5|t1tties|teets|teez|testical|testicle|tit|titfuck|tits|titt|tittie5|tittiefucker|titties|tittyfuck|tittywank|titwank|tosser|turd|tw4t|twat|twathead|twatty|twunt|twunter|v14gra|v1gra|vagina|viagra|vulva|w00se|wang|wank|wanker|wanky|whoar|whore|willies|willy|xrated|xxx)\b/i
let settings = require('../functions/settings');
let globalBlacklist = require('../functions/globalBlacklist');
let nums = require('../functions/numbers');
let lists = require('../functions/lists');

module.exports = {
    name: 'messageCreate',

    exec: (client, msg) => {
        ++nums.msgsRead;
        if (msg.author.bot) return;
        settings.getValueByID(msg.channel.guild.id).then(stat => {
            if (!settings.getFlags(stat.flags).includes('SWEAR_RESPONSES')) return;
            settings.getValueByID(msg.channel.id).then(stat => {
                if (!settings.getFlags(stat.flags).includes('SWEAR_RESPONSES')) return;
                settings.getValueByID(msg.author.id).then(stat => {
                    if (!settings.getFlags(stat.flags).includes('SWEAR_RESPONSES')) return;
                    globalBlacklist.getValueByID(msg.channel.guild.id).then(stat => {
                        if (stat) return;
                        globalBlacklist.getValueByID(msg.channel.id).then(stat => {
                            if (stat) return;
                            globalBlacklist.getValueByID(msg.author.id).then(stat => {
                                if (stat) return;
                                if (msg.content.match(swears)) {
                                    msg.channel.sendTyping().catch(err => {});;
                                    function messageDelete(message) {
                                        if (message.id === msg.id) {
                                            clearTimeout(timeout);
                                            msg.channel.sendTyping();
                                            setTimeout(() => {
                                                msg.channel.createMessage(`I saw you say that <@${msg.author.id}>, dont think i didnt see that. I have eyes in the back of me you know.`);
                                            }, 9000)
                                        }
                                    }
                                    client.on('messageDelete', messageDelete);
                                    var timeout = setTimeout(() => {
                                        msg.channel.createMessage(`HEY <@${msg.author.id}> NO SWEARING IN MY PRESENCE OR I WILL BE MAD!!!!!!!!!!!!!`).catch(() => { });
                                        client.off('messageDelete', messageDelete);
                                    }, 8000);
                                    ++nums.responses;
                                }
                            });
                        });
                    });
                });
            });
        });
        settings.getValueByID(msg.channel.guild.id).then(stat => {
            if (!settings.getFlags(stat.flags).includes('RANDOM_RESPONSES')) return;
            settings.getValueByID(msg.channel.id).then(stat => {
                if (!settings.getFlags(stat.flags).includes('RANDOM_RESPONSES')) return;
                settings.getValueByID(msg.author.id).then(stat => {
                    if (!settings.getFlags(stat.flags).includes('RANDOM_RESPONSES')) return;
                    globalBlacklist.getValueByID(msg.channel.guild.id).then(stat => {
                        if (stat) return;
                        globalBlacklist.getValueByID(msg.channel.id).then(stat => {
                            if (stat) return;
                            globalBlacklist.getValueByID(msg.author.id).then(stat => {
                                if (stat) return;
                                if (Math.floor(Math.random() * 30) === 29) {
                                    var thing = lists.things[Math.floor(Math.random() * lists.things.length)],
                                        time = thing.length * 125;
                                    msg.channel.sendTyping().catch(err => {});;
                                    setTimeout(() => {
                                        msg.channel.createMessage(thing).catch(() => { });
                                    }, time);
                                    ++nums.responses;
                                }
                            });
                        });
                    });
                });
            });
        });
    }
}