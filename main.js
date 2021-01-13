const Discord = require('discord.js');
const Lua = require('lua-in-js');

const { T } = require('./src/Translate.js');
const Perk = require('./src/Perk.js');
const Commands = require('./src/Commands.js');
const Misc = require('./src/Misc.js');
const MediaWikiAPI = require('./src/MediaWikiAPI.js');

const wikiapi = new MediaWikiAPI(Misc.DBD_WIKI_API);
const luaenv = Lua.createEnv();

function create() {
    const Client = new Discord.Client();

    Client.login(process.env.SESSION_DISCORD_TOKEN);

    Client.on('ready', () => onReady(Client));
    Client.on('message', (message) => onMessage(message, Client));
}

let perk_list = [];
let perkTable = {};
let iconTable = {};
let characterTable = {};

async function processShrine(json) {
	const wikitext = json['*']; 
    const shrineHistory = luaenv.parse(json['*'] + "\n" + "return sos").exec().numValues.slice(1).map(it => it.numValues.slice(1));
	const currentShrine = shrineHistory[0];
	
	console.log(currentShrine);

    if (perk_list.filter(it => currentShrine.indexOf(it.getID()) !== -1 ).length === 0) {
        console.log("New perk(s) found in shrine, updating...");
        
        const [ perkDatatable, iconDatatable, miscDatatable ] = await Promise.all([
            wikiapi.parse('Module:Datatable/Perks'),
            wikiapi.parse('Module:Datatable/Icons'),
            wikiapi.parse('Module:Datatable')
        ]);
        
        perkTable = luaenv.parse(Misc.PERK_DATATABLE_DUMMY_CODE + "\n" + Misc.LUA_ARRAY_TO_TABLE + "\n" + perkDatatable['*'] + "\n" + 'return arrayToTable("id", perks)').exec().numValues.slice(1).map(it => it.strValues);
        iconTable = Misc.objectMap(luaenv.parse(iconDatatable['*'] + "\n" + Misc.LUA_ARRAY_TO_TABLE + "\n" + 'return arrayToTable("icon", icons)').exec().strValues, (k, v) => v.strValues);
        characterTable['K'] = luaenv.parse(miscDatatable['*'] + "\n" + Misc.LUA_ARRAY_TO_TABLE + "\n" + 'return arrayToTable("id", killers)').exec().numValues.slice(1).map(it => it.strValues);
        characterTable['S'] = luaenv.parse(miscDatatable['*'] + "\n" + Misc.LUA_ARRAY_TO_TABLE + "\n" + 'return arrayToTable("id", survivors)').exec().numValues.slice(1).map(it => it.strValues);        
        
        perk_list = currentShrine.map(perkID => 
            new Perk(
                perkID - 1, 
                perkTable[perkID - 1]["name"], 
                characterTable[perkTable[perkID - 1]["charType"]][perkTable[perkID - 1]["character"] - 1]["name"], 
                shrineHistory.some(shr => shr.includes(perkID)) ? 2000 : 2700,
                iconTable[perkTable[perkID - 1]["name"]]["iconFile"],
                characterTable[perkTable[perkID - 1]["charType"]][perkTable[perkID - 1]["character"] - 1]["name"] + Misc.PERK_OWNER_PORTRAIT_FILE_SUFFIX,
                wikiapi
            )
        );
    } else {
        console.log("Nothing new in shrine");
    }
}

function errorHandler(error) {
    console.log(error);
    process.exit(1);
}

function refresh() {
    wikiapi.parse('Module:Datatable/SoS').then(processShrine).catch(errorHandler);
}

function onMessage(message, Client) {
    const { author, channel, content, guild } = message;

    if (author == Client.user) return;
    if (!message.isMentioned(Client.user)) return;

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
