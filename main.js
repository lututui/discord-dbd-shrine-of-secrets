const Discord = require('discord.js');

const { T } = require('./src/Translate.js');
const Perk = require('./src/Perk.js');
const Commands = require('./src/Commands.js');
const Misc = require('./src/Misc.js');
const MediaWikiAPI = require('./src/MediaWikiAPI.js');

const wikiapi = new MediaWikiAPI(Misc.DBD_WIKI_API);

function create() {
    const Client = new Discord.Client();

    Client.login(process.env.SESSION_DISCORD_TOKEN);

    Client.on('ready', () => onReady(Client));
    Client.on('message', (message) => onMessage(message, Client));
}

let perk_list = [];

async function processShrine(json) {
    const wikitext = json['*'];
    const template = wikitext.substr(0, wikitext.indexOf("<!--")).trim();
    const boundries = [ template.indexOf("|") + 1, template.indexOf("}") ];
    const perkIDs = template.substr(boundries[0], boundries[1] - boundries[0]).split("|");

    if (perk_list.filter(it => perkIDs.indexOf(it.getID()) !== -1 ).length === 0) {
        console.log("New perk(s) found in shrine, updating...");
        perk_list = perkIDs.map(it => new Perk(it, wikiapi));
    } else {
        console.log("Nothing new in shrine");
    }
}

function errorHandler(error) {
    console.log(error);
    process.exit(1);
}

function refresh() {
    wikiapi.parse('Template:Shrine_of_Secrets').then(processShrine).catch(errorHandler);
}

function onMessage(message, Client) {
    const { author, channel, content, guild } = message;

    if (author == Client.user) return;
    if (!content.startsWith(Client.user.toString())) return;

    const command = content.trim().split(' ');
    const isDM = channel.type === 'dm' || channel.type === 'group';
    const isADM = isDM || channel.type === 'text' && channel.memberPermissions(author).has(Discord.Permissions.FLAGS.MANAGE_CHANNELS);
    const id = isDM ? channel.id : guild.id;
    
    if (perk_list.length === 0) {
        channel.send(T("Not available right now, try again in a minute or so", id));
        return;
    }

    switch (command[1]) {
        case 'shrine':
            Commands.cmdRefresh(channel, id);
            Commands.cmdShrine(channel, id, perk_list);
            break;
        case 'refresh':
            Commands.cmdRefresh(channel, id);
            break;
        case 'locale':
            Commands.cmdLocale(channel, id, command[2], isADM);
            break;
        case 'help':
        default:
            Commands.cmdHelp(Client, channel, id);
            break;
    }
}

function onReady(Client) {
    Client.user.setActivity('Dead by Daylight', { type : 'PLAYING' });
    refresh();
}

setInterval(refresh, 180000);
create();
