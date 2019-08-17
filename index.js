const Discord = require("discord.js");
const moment = require('moment')
const client = new Discord.Client({
    autoReconnect: true,
    messageCacheMaxSize: 10,
    messageCacheLifetime: 30,
    messageSweepInterval: 35
});
const config = require('./data/config.json')
const token = config.token
const DBLToken = config.dbltoken
const DBL = require('dblapi.js')
const dbl = new DBL(DBLToken) 
const fs = require('fs')
const fse = require('fs-extra')
const package = require('./package.json')
const color = config.color
const cleverbot = require('cleverbot.io')
const clever = new cleverbot('eStbMZNduqG7EDbw', 'dvMd4iay4b5gFsQ904HTtIzH9NHVUdTo');
var strings = require('./data/src/strings/main.json')

function exit() {	
    process.exit(0)
}	

var defaultChannelMeta = {
    name: "null",
    id: "null"
}
var dCM = JSON.stringify(defaultChannelMeta, null, 2)

var defaultAlertSettingsMeta = {
	disableMaintenance: false,
	disablePatreon: false
}
var dASM = JSON.stringify(defaultAlertSettingsMeta)

var blPath = {
    supportServer: "./data/blacklist/support/server.json",
    supportUser: "./data/blacklist/support/user.json"
}

const triggerIgnore = ["<ignore>", "<i>", "<!>", "<!ignore"];

const getDefaultChannel = (guild) => {
  // get "original" default channel
  if(guild.channels.has(guild.id))
    return guild.channels.get(guild.id)
  // Check for a "general" channel, which is often default chat
  const generalChannel = guild.channels.find(channel => channel.name === "general");
  if (generalChannel)
    return generalChannel;
  // Now we get into the heavy stuff: first channel in order where the bot can speak
  // hold on to your hats!
  return guild.channels
   .filter(c => c.type === "text" &&
     c.permissionsFor(guild.client.user).has("SEND_MESSAGES"))
   .sort((a, b) => a.position - b.position ||
     Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
   .first();
}


client.on("ready", () => {

        function statUpdate() {
			
			client.shard.fetchClientValues('guilds.size')
			.then(results => {
				var res = results.reduce((prev, guildCount) => prev + guildCount, 0)
				
				fs.readFile(`./data/shardCount`, 'utf8', function(err, shardCount) {
                    shardCount = parseInt(shardCount)
                    try {
                        dbl.postStats(client.guilds.size, client.shard.id, shardCount)
                    } catch (ex) {
                    }
				})
            	client.user.setActivity('you on ' + res + ' servers', {
                type: 'LISTENING'
            })
            fs.writeFile(`./data/guildCount`, parseInt(res), function(err) {
            	if(err) return console.log(err)
            })
            
			})
            return console.log(`[STATS] Stats Updated -- [SHARD #] ${client.shard.id}`)
        }
           
        statUpdate()
        setInterval(statUpdate, 120000)

        console.log('[Logged In] ' + client.user.tag)
        console.log('[Time] ' + moment().format('MMMM Do YYYY, h:mm:ss a'))
        console.log(`[Shard #] ${client.shard.id}`)
})

client.on("message", (message) => {
    // This is used for inits
    if(!fs.existsSync(`./data/serverdata`)) {
        fs.mkdirSync(`./data/serverdata`)
    }
         
    if(message.channel.type !== "dm") {
        if(!fs.existsSync(`./data/serverdata/${message.guild.id}`)) {
            fs.mkdirSync(`./data/serverdata/${message.guild.id}`)
        }
        if(!fs.existsSync(`./data/serverdata/${message.guild.id}/alertSettings.json`)) {
            	if(!fs.existsSync(`./data/serverdata/${message.guild.id}`)) {
            		fs.mkdirSync(`./data/serverdata/${message.guild.id}`)
            	}
                fs.writeFile(`./data/serverdata/${message.guild.id}/alertSettings.json`, dASM, function(err) {
                	if(err) return message.channel.send(strings.error.unexpected + err)
                })
            }
    }
    
    
})

clever.setNick('CleverBot')
clever.create(function (sessionerr, session) {

        client.on("message", (message) => {
            if (!message.channel.type == 'dm') {
                
                if (!fs.existsSync(`./data/serverdata/${message.guild.id}`)) {
                    fs.mkdirSync(`./data/serverdata/${message.guild.id}`)
                }
                
            if(!fs.existsSync(`./data/serverdata/${message.guild.id}/alertSettings.json`)) {
            	if(!fs.existsSync(`./data/serverdata/${message.guild.id}`)) {
            		fs.mkdirSync(`./data/serverdata/${message.guild.id}`)
            	}
                fs.writeFile(`./data/serverdata/${message.guild.id}/alertSettings.json`, dASM, function(err) {
                	if(err) return message.channel.send(strings.error.unexpected + err)
                })
            }
                if (!fs.existsSync(`./data/serverdata/${message.guild.id}/channel.json`)) {
                    fs.writeFileSync(`./data/serverdata/${message.guild.id}/channel.json`, dCM, function (err) {
                        if (err) return console.log(strings.error.unexpected + err)
                    })
                }
                if (!fs.existsSync(`./data/serverdata/${message.guild.id}/${message.author.id}`)) {
                    fs.mkdirSync(`./data/serverdata/${message.guild.id}/${message.author.id}`)
                }
            }
        })

    client.on("message", (message) => {

        const prefixMention = new RegExp(`^<@!?${client.user.id}>`);
        const prefix = message.content.match(prefixMention) ? message.content.match(prefixMention)[0] : config.testString;


        const args = message.content.split(" ");

        if (message.author.bot) return;
        if (message.author == client.user) return;

        var cmd = message.content
/* Commands */
		if(cmd.startsWith(`${prefix} stop`)) {
			if(message.author.id !== "270375857384587264") return;
			client.shard.broadcastEval('process.exit();');
			return;
        }
        if(cmd.startsWith(`${prefix} ping`)) {
        	var pingstart = new Discord.RichEmbed()
		        .setDescription('Pinging...')
		        .setAuthor(message.author.username, message.author.displayAvatarURL)
		    message.channel.send({embed: pingstart}).then(sent => {
        	var pinged = new Discord.RichEmbed()
	          .setTitle('**Pong!**')
	          .setDescription(`${sent.createdTimestamp - message.createdTimestamp}ms`)
        sent.edit({embed: pinged})
      })
    }
        if (cmd.startsWith(`${prefix} privacy`)) {
            var privacy = new Discord.RichEmbed()
                .setColor(color)
                .setTitle(strings.privacy.title)
                .setDescription(strings.privacy.desc)
                .addField(strings.privacy.messages.title, strings.privacy.messages.desc)
                .addField(strings.privacy.channels.title, strings.privacy.channels.desc)
                .addField(strings.privacy.ids.title, strings.privacy.ids.desc)
                .addField(strings.privacy.interactions.title, strings.privacy.interactions.desc)
                .setFooter(strings.privacy.footer)
            return message.channel.send({embed: privacy})
        }
        if(cmd.startsWith(`${prefix} support`)) {
            var userblacklist = require(blPath.supportUser)
            var serverblacklist = require(blPath.supportUser)
            if(userblacklist.some(ubl => message.author.id.includes(ubl))) return message.channel.send('Your ID has been blacklisted for this command')
            if(serverblacklist.some(sbl => message.guild.id.includes(sbl))) return message.channel.send('Your Server has been blacklisted for this command')

            var supportMessage = message.content.split(/\s+/g).slice(2).join(" ");
            
            var supportHelp = new Discord.RichEmbed()
                .setColor(color)
                .setTitle('Support')
                .setDescription(strings.cmd.support.desc)
                .setAuthor(client.user.username, client.user.displayAvatarURL)

            if(supportMessage.length < 1) return message.channel.send({embed: supportHelp})

            if(message.channel.type == 'dm') {
                var dataObj = {
                    message: supportMessage,
                    authorTag: message.author.tag,
                    authorID: message.author.id,
                }
                var supportDMContent = JSON.stringify(dataObj, null, 2)

                if (!fs.existsSync(`./data/logs`)) {
                    fs.mkdirSync(`./data/logs`)
                }
                if (!fs.existsSync(`./data/logs/support`)) {
                    fs.mkdirSync(`./data/logs/support`)
                }
                if (!fs.existsSync(`./data/logs/support/dm/${message.author.id}`)) {
                    fs.mkdirSync(`./data/logs/support/dm/${message.author.id}`)
                }
                fs.writeFileSync(`./data/logs/support/dm/${message.author.id}/${Date.now()}.json`, supportDMContent, function (err) {
                    if (err) return console.log('[ERROR] ' + err)
                });

                var support = new Discord.RichEmbed()
                    .setColor(color)
                    .setTitle('Support Message')
                    .setDescription('A suppport message has come in from ' + dataObj.authorTag + " in a DM")
                    .addField('Message', dataObj.message)
                    .addField('Author Tag', dataObj.authorTag)
                    .addField('Author ID', message.author.id)
                    .setFooter('Since this came from a DM, there is no Guild ID or Name associated with it.')
                    message.channel.send(strings.cmd.support.confirmation)
                    client.users.get("270375857384587264").send({embed: support});
                    return;
            }
            var dataObj = {
                message: supportMessage,
                authorTag: message.author.tag,
                authorID: message.author.id,
                guildID: message.guild.id,
                guildName: message.guild.name 
            }
            var supportContent = JSON.stringify(dataObj, null, 2)

            if (!fs.existsSync(`./data/serverdata/${message.guild.id}`)) {
                fs.mkdirSync(`./data/serverdata/${message.guild.id}`)
            }
            if(!fs.existsSync(`./data/serverdata/${message.guild.id}`)) {
                fs.mkdir(`./data/serverdata/${message.guild.id}`)
            }
            if(!fs.existsSync(`./data/serverdata/${message.guild.id}/alertSettings.json`)) {
            	if(!fs.existsSync(`./data/serverdata/${message.guild.id}`)) {
            		fs.mkdirSync(`./data/serverdata/${message.guild.id}`)
            	}
                fs.writeFile(`./data/serverdata/${message.guild.id}/alertSettings.json`, dASM, function(err) {
                	if(err) return message.channel.send(strings.error.unexpected + err)
                })
            }
            if (!fs.existsSync(`./data/logs`)) {
                fs.mkdirSync(`./data/logs`)
            }
            if (!fs.existsSync(`./data/logs/support/`)) {
                fs.mkdirSync(`./data/logs/support/`)
            }
            if (!fs.existsSync(`./data/logs/support/${message.guild.id}`)) {
                fs.mkdirSync(`./data/logs/support/${message.guild.id}`)
            }
            fs.writeFileSync(`./data/logs/support/${message.guild.id}/${Date.now()}.json`, supportContent, function (err) {
                if(err) return message.channel.send(strings.error.unexpected + err)
            });

            var support = new Discord.RichEmbed()
            .setColor(color)
            .setTitle('Support Message')
            .setDescription('A suppport message has come in from ' + dataObj.authorTag)
            .addField('Message', dataObj.message)
            .addField('Author Tag', dataObj.authorTag)
            .addField('Author ID', message.author.id)
            .addField('Guild Name', message.guild.name)
            .addField('Guild ID', message.guild.id)
            message.channel.send(strings.cmd.support.confirmation)
            client.users.get("270375857384587264").send({embed: support});
            return;

        } 
        if(cmd.startsWith(`${prefix} settings`)) return message.channel.send("This command has moved to `toggle`")
     	if (cmd.startsWith(`${prefix} toggle`)) {
     		// Toggle command
     		
     		if(!fs.existsSync(`./data/serverdata/${message.guild.id}`)) {
                fs.mkdir(`./data/serverdata/${message.guild.id}`)
            }
            if(!fs.existsSync(`./data/serverdata/${message.guild.id}/alertSettings.json`)) {
            	if(!fs.existsSync(`./data/serverdata/${message.guild.id}`)) {
            		fs.mkdirSync(`./data/serverdata/${message.guild.id}`)
            	}
                fs.writeFile(`./data/serverdata/${message.guild.id}/alertSettings.json`, dASM, function(err) {
                	if(err) return message.channel.send(strings.error.unexpected + err)
                })
            }
            
            function getDesc(suffPerms) {
    			var sufficientPerms = strings.cmd.toggle.desc.sufficientPerms
    			var insufficientPerms = strings.cmd.toggle.desc.insufficientPerms
   			
    			if(!suffPerms) return insufficientPerms;
    			if(suffPerms) return sufficientPerms;
				return sufficientPerms;
    		}
    		
    		var p = true
    		
    		if (!message.member.hasPermission('MANAGE_CHANNELS')) {
    			p = false
    		}
    		if (message.member.hasPermission('MANAGE_CHANNELS')) {
    			p = true
    		}

     		var info = new Discord.RichEmbed()
     			.setColor(config.color)
     			.setTitle("Toggle")
     			.setDescription(getDesc(p) +
    							"`toggle maintenance` - **Toggles On/Off maintenance alerts for your server**\n" + 
    							"`toggle patreon` - **Toggles On/Off patreon reminders for your server**")
    			.setAuthor(message.guild.name, message.guild.iconURL)
    		
    		var setting = args[2]
    		
    		if(!setting) return message.channel.send(info)
    			
    			fs.readFile(`./data/serverdata/${message.guild.id}/alertSettings.json`, 'utf8', function(err, alertSettings) {
    			
    			try {
    			var g = null
    			if (/^[\],:{}\s]*$/.test(alertSettings.replace(/\\["\\\/bfnrtu]/g, '@').
				replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
				replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
				g = true
				}else{
					g = false
				  message.channel.send(strings.error.corruptDBFile)
					return fs.unlink(`./data/serverdata/${message.guild.id}/alertSettings.json`)
				}
				} catch (ex) {
                }
            
    				alertSettings = JSON.parse(alertSettings)
    				
    			
    			if(setting.includes("maintenance")) { // Toggle Maintenance Alerts (Default is disable = false)
    			if(!p) return message.channel.send(strings.error.manageChannelsPermReq)
    			
    			if(alertSettings.disableMaintenance == false) {
    				// Change to true aka Disable Maintenance Alerts
    				
    				defaultAlertSettingsMeta = {
						disableMaintenance: true,
						disablePatreon: alertSettings.disablePatreon
					}
					var newAlertSettings = JSON.stringify(defaultAlertSettingsMeta)
    				
    				fs.writeFile(`./data/serverdata/${message.guild.id}/alertSettings.json`, newAlertSettings, function(err) {
    					if(err) return message.channel.send(strings.error.unexpected + err)
    					message.channel.send("Successfully disabled Maintenance Alerts")
    				})
    				return;
    			}
    			// Change to false aka Enable Maintenance Alerts
    				
    				defaultAlertSettingsMeta = {
						disableMaintenance: false,
						disablePatreon: alertSettings.disablePatreon
					}
					var newAlertSettings = JSON.stringify(defaultAlertSettingsMeta)
    				
    				fs.writeFile(`./data/serverdata/${message.guild.id}/alertSettings.json`, newAlertSettings, function(err) {
    					if(err) return message.channel.send(strings.error.unexpected + err)
    					message.channel.send(strings.confirm.enabledMaintenanceAlerts)
    				})
    				
    			return;
    			}
    			if(setting.includes("patreon") || setting.includes("upvote") || setting.includes("donate")) {
    			// Toggle Patreon Alerts (Default is disable = false)
    				if(!p) return message.channel.send("You do not have the `MANAGE_CHANNELS` permission. Please ask your server moderator to enable this.")
    			
    			if(alertSettings.disablePatreon == false) {
    				// Change to true aka Disable Patreon Alerts
    				
    				defaultAlertSettingsMeta = {
						disableMaintenance: alertSettings.disableMaintenance,
						disablePatreon: true
					}
					var newAlertSettings = JSON.stringify(defaultAlertSettingsMeta)
    				
    				fs.writeFile(`./data/serverdata/${message.guild.id}/alertSettings.json`, newAlertSettings, function(err) {
    					if(err) return message.channel.send(strings.error.unexpected + err)
    					message.channel.send("Successfully disabled Patreon Alerts")
    				})
    				return;
    			}
    			// Change to false aka Enable Patreon Alerts
    				
    				defaultAlertSettingsMeta = {
						disableMaintenance: alertSettings.disableMaintenance,
						disablePatreon: false
					}
					var newAlertSettings = JSON.stringify(defaultAlertSettingsMeta)
    				
    				fs.writeFile(`./data/serverdata/${message.guild.id}/alertSettings.json`, newAlertSettings, function(err) {
    					if(err) return message.channel.send(strings.error.unexpected + err)
    					message.channel.send("Successfully enabled Patreon Alerts")
    				})
    			return;
    			}
    			return message.channel.send({embed: info})
    			})
    			return;
     		
     	}
 		if (cmd.startsWith(`${prefix} unbind`)) {
            // UnBind command
            if (message.channel.type == 'dm') return message.channel.send(strings.error.dmunBind) //This can't be used in a DM for obvious reason
            if(!fs.existsSync(`./data/serverdata/`)) {
                fs.mkdir(`./data/serverdata/`)
            }
            if(!fs.existsSync(`./data/serverdata/${message.guild.id}`)) {
                fs.mkdir(`./data/serverdata/${message.guild.id}`)
            }
            if(!fs.existsSync(`./data/serverdata/${message.guild.id}/alertSettings.json`)) {
            	if(!fs.existsSync(`./data/serverdata/${message.guild.id}`)) {
            		fs.mkdirSync(`./data/serverdata/${message.guild.id}`)
            	}
                fs.writeFile(`./data/serverdata/${message.guild.id}/alertSettings.json`, dASM, function(err) {
                	if(err) return message.channel.send(strings.error.unexpected + err)
                })
            }

            var metaObj = dCM
            try {
                if(!fs.existsSync(`./data/serverdata/${message.guild.id}/channel.json`)) return message.channel.send("Bound Channel not found")
                fs.readFile(`./data/serverdata/${message.guild.id}/channel.json`, "utf8", function(err, data) {
                
                try {
                var g = null
                if (/^[\],:{}\s]*$/.test(data.replace(/\\["\\\/bfnrtu]/g, '@').
				replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
				replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
				g = true
				}else{
				g = false
				  message.channel.send(strings.error.corruptDBFile)
					return fs.unlink(`./data/serverdata/${message.guild.id}/channel.json`)
				}
				} catch (ex) {
																				
										}
                
                    data = JSON.parse(data)
                    if(data.id == null) return message.channel.send(strings.error.noBoundChannel)
                    if(data.name == null) return message.channel.send(strings.error.noBoundChannel)
                    if(data.id == "null") return message.channel.send(strings.error.noBoundChannel)
                    if(data.name == "null") return message.channel.send(strings.error.noBoundChannel)
                    if (!message.member.hasPermission('MANAGE_CHANNELS')) return message.channel.send(strings.error.manageChannelsPermReq).catch(console.error);

                    fs.writeFile(`./data/serverdata/${message.guild.id}/channel.json`, metaObj, function(err) {
                        if(err) return message.channel.send(strings.error.unexpected + err)
                        return message.channel.send("Successfully unbound channel <#" + data.id + "> . You can rebind channels using <@" + client.user.id + "> `bind`")
                    })
                    return;
                })
                return;
            } catch (ex) {
                return message.channel.send(strings.error.unexpected + ex)
            }
            return;
        }
        if (cmd.startsWith(`${prefix} bind`)) {
            //Bind Command
            if (message.channel.type == 'dm') return message.channel.send(strings.error.dmBind) //This can't be used in a DM for obvious reason
            
            var channelID = message.content.split(/\s+/g).slice(2).join(" ");
            var Channel = client.channels.find("id", channelID)
            var ChannelExists = client.channels.exists("id", channelID)
            var mentionedChannel = channelID.substr(2).slice(0, -1);
            if (channelID.length < 1) {
                // no channel provided, so will bind to current channel
                var channel = message.channel
                
                if (!message.member.hasPermission('MANAGE_CHANNELS')) return message.channel.send(strings.error.manageChannelsPermReq).catch(console.error);

                var channelMeta = {
                    name: channel.name,
                    id: channel.id
                }
                metaObj = JSON.stringify(channelMeta, null, 2)

                if(!fs.existsSync(`./data/serverdata/`)) {
                    fs.mkdir(`./data/serverdata/`)
                }
                if(!fs.existsSync(`./data/serverdata/${message.guild.id}`)) {
                    fs.mkdir(`./data/serverdata/${message.guild.id}`)
                }
				if(!fs.existsSync(`./data/serverdata/${message.guild.id}/alertSettings.json`)) {
            	if(!fs.existsSync(`./data/serverdata/${message.guild.id}`)) {
            		fs.mkdirSync(`./data/serverdata/${message.guild.id}`)
            	}
                fs.writeFile(`./data/serverdata/${message.guild.id}/alertSettings.json`, dASM, function(err) {
                	if(err) return message.channel.send(strings.error.unexpected + err)
                })
            }
                try {
                    fs.writeFile(`./data/serverdata/${message.guild.id}/channel.json`, metaObj, function (err) {
                        if (err) return console.log(strings.error.unexpected + err)
                        message.channel.send(strings.confirm.autoBind)
                    })
                    return;
                } catch (ex) {
                    return message.channel.send(strings.error.unexpected + ex)
                }
                return;
            }
            if (channelID.length < 17) return message.channel.send(strings.error.noChannelID)

            if (channelID.startsWith('<#') && channelID.endsWith('>')) {
                var mentionChannelExists = client.channels.exists("id", mentionedChannel)
                var mentionChannel = client.channels.find("id", mentionedChannel)
                if (!mentionChannelExists) return message.channel.send(strings.error.valid_channelMen)

                if (!message.member.hasPermission('MANAGE_CHANNELS')) return message.channel.send(strings.error.manageChannelsPermReq).catch(console.error);
                
                var channelMeta = {
                    name: mentionChannel.name,
                    id: mentionChannel.id
                }
                var metaObj = JSON.stringify(channelMeta, null, 2)

                if(!fs.existsSync(`./data/serverdata/`)) {
                    fs.mkdir(`./data/serverdata/`)
                }
                if(!fs.existsSync(`./data/serverdata/${message.guild.id}`)) {
                    fs.mkdir(`./data/serverdata/${message.guild.id}`)
                }
                if(!fs.existsSync(`./data/serverdata/${message.guild.id}/alertSettings.json`)) {
            	if(!fs.existsSync(`./data/serverdata/${message.guild.id}`)) {
            		fs.mkdirSync(`./data/serverdata/${message.guild.id}`)
            	}
                fs.writeFile(`./data/serverdata/${message.guild.id}/alertSettings.json`, dASM, function(err) {
                	if(err) return message.channel.send(strings.error.unexpected + err)
                })
            }
                try {
                    fs.writeFile(`./data/serverdata/${message.guild.id}/channel.json`, metaObj, function (err) {
                        if (err) return message.channel.send(strings.error.unexpected + err)
                        message.channel.send('Bound to Channel <#' + mentionedChannel + '>\n\nTo chat with me, just send a message in that channel and I\'ll respond to you.')
                        mentionChannel.send('**' + message.author.tag + '** bound me to this channel')
                    })
                    return;
                } catch (ex) {
                    return message.channel.send(strings.error.unexpected + ex)
                }
                return;

            }
            if (!ChannelExists) return message.channel.send(strings.error.channel404)
            if (!message.member.hasPermission('MANAGE_CHANNELS')) return message.channel.send(strings.error.manageChannelsPermReq).catch(console.error);

            var channelMeta = {
                name: Channel.name,
                id: Channel.id
            }
            var metaObj = JSON.stringify(channelMeta, null, 2)
            try {
                fs.writeFile(`./data/serverdata/${message.guild.id}/channel.json`, metaObj, function (err) {
                    if (err) return message.channel.send(strings.error.unexpected + err)
                    message.channel.send('Bound to Channel <#' + channelID + '>\n\nTo chat with me, just send a message in that channel and I\'ll respond to you.')
                    Channel.send(message.author.tag + ' bound me to this channel')
    
                })
                return;
            } catch (ex) {
                return message.channel.send(strings.error.unexpected + ex)
            }
            return;
        }
        if (cmd.startsWith(`${prefix} restart`)) {
            if (message.author.id !== strings.botOwner) return;
            exit()
        }
        if(cmd.startsWith(`${prefix} credits`)) {
            var creds = new Discord.RichEmbed()
                .setColor(color)
                .setTitle('Credits')
                .setDescription('CleverBot wouldn\'t be CleverBot without the support of the projects and kind people below')
                .addField("CleverBot.io", "[By dtester and the CleverBot.io team](https://www.npmjs.com/package/cleverbot.io)")
                .addField("DiscordJS", "[Started by hydrabolt and maintained by the DJS Team](https://www.npmjs.com/package/discord.js)")
                .addField("fs-extra", "[By jprichardson, ryanzim, and manidlou](https://www.npmjs.com/package/fs-extra)")
                .addField("moment", "[By the momentjs team](https://www.npmjs.com/package/moment)")
                .setFooter('Most importantly the support of everyone who decided to invite CleverBot to their Discord Servers :)')
                return message.channel.send({embed: creds})
        }
        if(cmd.startsWith(`${prefix} findchannel`)) {

            function callback() {
                message.channel.send(strings.error.noBoundChannel)
            }
            if(message.channel.type == 'dm') return callback()
            try {
                fs.readFile(`./data/serverdata/${message.guild.id}/channel.json`, "utf8", function(err, boundChannel) {
                    if(err) return message.channel.send(strings.error.unexpected + err)
                    var chnl = JSON.parse(boundChannel)
					
					try {
					var g = null
					if (/^[\],:{}\s]*$/.test(boundChannel.replace(/\\["\\\/bfnrtu]/g, '@').
				replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
				replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
				g = true
				}else{
				g = false
				  message.channel.send(strings.error.corruptDBFile)
					return fs.unlink(`./data/serverdata/${message.guild.id}/channel.json`)
				}
				} catch (ex) {										
				}
                if(chnl.id == null) return message.channel.send(strings.error.noBoundChannel)
                if(chnl.name == null) return message.channel.send(strings.error.noBoundChannel)
                if(chnl.id == "null") return message.channel.send(strings.error.noBoundChannel)
                if(chnl.name == "null") return message.channel.send(strings.error.noBoundChannel)
                   return message.channel.send("Your bound channel is <#" + chnl.id + ">");
                })
            } catch (ex) {
                callback()
            }
            return;
        }
        if (cmd.startsWith(`${prefix}`)) {
            
            if(message.channel.type == 'dm') {
                var embed = new Discord.RichEmbed()
                .setColor(color)
                .setTitle(client.user.tag)
                
                .setDescription(strings.welcome.desc, true)
                .addField(`${strings.welcome.privacy.title}`, `${strings.welcome.privacy.desc} \`(\` <@${client.user.id}> \`privacy\` \`)\``, true)
                .addField(`${strings.welcome.getting_started.title}`, `${strings.welcome.getting_started.desc} <@${client.user.id}> `, true)
                .addField(`${strings.welcome.ignore.title}`, `${strings.welcome.ignore.desc} \`<ignore>\``, true)
                .addField(`${strings.welcome.credits.title}`, `${strings.welcome.credits.desc} <@${client.user.id}> \`credits\``, true)
                 .addField('Website', `[CleverBot Website](${strings.links.cleverbot})`, true)
                .addField('Invite', `[CleverBot Invite](${strings.links.invite.bot.cleverbot})`, true)
                .addField('Support Server', `[CleverBot Support Server](${strings.links.invite.discord.cleverbot})`, true)
                .addField('Discord Bot List', `[CleverBot DBL](${strings.links.listings.dbl})`, true)
                .addField('Bots on Discord Listing', `[CleverBot BOD Listing](${strings.links.listings.bod})`, true)
                .addField('Discord Bots Listing', `[CleverBot DB Listing](${strings.links.listings.db})`, true)
                .addField('Discord Bot Hub Listing', `[CleverBot DBH Listing](${strings.links.listings.dbh})`, true)

               .setFooter('CleverBot v' + package.version)
            return message.channel.send(embed)
            }
            if(message.channel.type == 'text') {
                if(fs.existsSync(`./data/serverdata/${message.guild.id}/channel.json`)) {
                    fs.readFile(`./data/serverdata/${message.guild.id}/channel.json`, function (err, channelData) {
                    
                        if(err) return message.channel.send(strings.error.unexpected + err)
                        
                        try {
                        var g = null
                        if (/^[\],:{}\s]*$/.test(channelData.replace(/\\["\\\/bfnrtu]/g, '@').
				replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
				replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
				g = true
				}else{
				g = false
				  message.channel.send(strings.error.corruptDBFile)
					return fs.unlink(`./data/serverdata/${message.guild.id}/channel.json`)
				}
				} catch (ex) {

										}
                        
                        var dat = JSON.parse(channelData)
                    var embed = new Discord.RichEmbed()
                    .setColor(color)
                    .setTitle(client.user.tag)
                    .setDescription(strings.welcome.desc, true)
                    .addField(`${strings.welcome.privacy.title}`, `${strings.welcome.privacy.desc} \`(\` <@${client.user.id}> \`privacy\` \`)\``, true)
                    .addField(`${strings.welcome.getting_started.title}`,  `${strings.welcome.getting_started.desc} <@${client.user.id}> `, true)
                    .addField(`${strings.welcome.settings.title}`, `${strings.welcome.settings.desc} <@${client.user.id}> \`toggle\``, true)
                    .addField(`${strings.welcome.ignore.title}`, `${strings.welcome.ignore.desc} \`<!>\``, true)
                    .addField(`${strings.welcome.unbind.title}`, `${strings.welcome.unbind.desc} <@${client.user.id}> \`unbind\``, true)
                    .addField(`${strings.welcome.credits.title}`, `${strings.welcome.credits.desc} <@${client.user.id}> \`credits\``, true)
                    .addField('Bound Channel', `<#${dat.id}>`, true)
                    .addField(`${strings.welcome.find.title}`, `${strings.welcome.find.title} <@${client.user.id}> \`findchannel\``, true)
                 .addField('Website', `[CleverBot Website](${strings.links.cleverbot})`, true)
                .addField('Invite', `[CleverBot Invite](${strings.links.invite.bot.cleverbot})`, true)
                .addField('Support Server', `[CleverBot Support Server](${strings.links.invite.discord.cleverbot})`, true)
                .addField('Discord Bot List', `[CleverBot DBL](${strings.links.listings.dbl})`, true)
                .addField('Bots on Discord Listing', `[CleverBot BOD Listing](${strings.links.listings.bod})`, true)
                .addField('Discord Bots Listing', `[CleverBot DB Listing](${strings.links.listings.db})`, true)
                .addField('Discord Bot Hub Listing', `[CleverBot DBH Listing](${strings.links.listings.dbh})`, true)
                    .setFooter('CleverBot v' + package.version)
                return message.channel.send(embed)
                    });
                } else {
                    var embed = new Discord.RichEmbed()
                    .setColor(color)
                    .setTitle(client.user.tag)
                    .setDescription(strings.welcome.desc, true)
                    .addField(`${strings.welcome.privacy.title}`, `${strings.welcome.privacy.desc} \`(\` <@${client.user.id}> \`privacy\` \`)\``, true)
                    .addField(`${strings.welcome.getting_started.title}`,  `${strings.welcome.getting_started.desc} <@${client.user.id}> `, true)
                    .addField(`${strings.welcome.settings.title}`, `${strings.welcome.settings.desc} <@${client.user.id}> \`toggle\``, true)
                    .addField(`${strings.welcome.credits.title}`, `${strings.welcome.credits.desc} <@${client.user.id}> \`credits\``, true)
                    .addField('Website', `[CleverBot Website](${strings.links.cleverbot})`, true)
                    .addField('Invite', `[CleverBot Invite](${strings.links.invite.bot.cleverbot})`, true)
                    .addField('Support Server', `[CleverBot Support Server](${strings.links.invite.discord.cleverbot})`, true)
                    .addField('Discord Bot List', `[CleverBot DBL](${strings.links.listings.dbl})`, true)
                    .addField('Bots on Discord Listing', `[CleverBot BOD Listing](${strings.links.listings.bod})`, true)
                    .addField('Discord Bots Listing', `[CleverBot DB Listing](${strings.links.listings.db})`, true)
                    .addField('Discord Bot Hub Listing', `[CleverBot DBH Listing](${strings.links.listings.dbh})`, true)
                    .setFooter('CleverBot v' + package.version)
                return message.channel.send(embed)
                }
             }
            return;
        } else {
        if (message.author.id == "579820311977918475") return;
            
            if (message.channel.type == 'dm') {
            
		    if(message.content.length < 1) return;
			
        if( triggerIgnore.some(i => message.content.startsWith(i))) return;
	message.channel.startTyping()
	
	
                if(sessionerr) return message.channel.send(strings.error.unexpected + err).then(msg => {
                    msg.channel.stopTyping()
                })
                
                try { 
                clever.ask(message.content, function (err, response) {
                    if(err) return message.channel.send(strings.error.unexpected + err).then(msg => {
                        msg.channel.stopTyping()
                    })
                    var dmLogObj = {
                        message: message.content,
                        authorID: message.author.id,
                        response: response,
                        channel: message.channel.type,
                    }
                    
                    fs.readFile(`./data/src/announcement.json`, function (err, announcementDat) {
                                    if(err) return message.channel.send(strings.error.unexpected + err)
									
							
									
                                    var announcementObj = JSON.parse(announcementDat)
                                    
						function sendResponse(msg, response, announcement) {
										
										 var maintenanceAlert = new Discord.RichEmbed()
                                    	.setColor(announcement.maintenance.color)
                                    	.setTitle(announcement.maintenance.title)
                                    	.setDescription(announcement.maintenance.notice)
                                    	
                                    	var supportTheBotReminder = new Discord.RichEmbed()
                                    	.setColor(announcement.support.color)
                                    	.setTitle(announcement.support.title)
                                    	.setDescription(announcement.support.desc)
                                    	.setURL(announcement.support.url)

    									function defaultResponse() {
    										msg.channel.send(`${response}`).then(msg => {
												msg.channel.stopTyping()
											})
											return;
    									}
    									function patreonResponse() {
    									if(Math.random() > 0.85) {
    										msg.channel.send(`${response}`, {embed: supportTheBotReminder}).then(msg => {
													msg.channel.stopTyping()
											})
											return;
											}
											defaultResponse()
    									}
    									function maintenanceResponse() {
    									
    									if(Math.random() > 0.75) {
    										msg.channel.send(`${response}`, {embed: maintenanceAlert}).then(msg => {
													msg.channel.stopTyping()
											})
											return;
											}
											defaultResponse()
    									}
    			
										if(announcement.maintenance.active == true) return patreonResponse()
										if(announcement.maintenance.active == false) return maintenanceResponse()
										return defaultResponse()
									
						}
						return sendResponse(message, response, announcementObj);
						});
                    return;
                })
                return;
                } catch (ex) { 
                	return message.channel.send(strings.error.unexpected + ex)
                }
                return;
            }
            if (message.channel.type == 'text') {
    
            if (message.guild.id == "578241309765009418") return;
            if (message.author.id == "579820311977918475") return;
            
            if(!fs.existsSync(`./data/serverdata/${message.guild.id}/channel.json`)) return;
                fs.readFile(`./data/serverdata/${message.guild.id}/channel.json`, 'utf8', function(err, newChannel) {
                    if(err) return message.channel.send(strings.error.unexpected + err)
					
					try {
					var g = null
					if (/^[\],:{}\s]*$/.test(newChannel.replace(/\\["\\\/bfnrtu]/g, '@').
						replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
						replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
						g = true
						}else{
						g = false
						  message.channel.send(strings.error.corruptDBFile)
							return fs.unlink(`./data/serverdata/${message.guild.id}/channel.json`)
						}
						} catch (ex) {
										}
					
                    var nChannel = JSON.parse(newChannel)
                    
                    if(message.channel.id !== nChannel.id) return;
                    if(message.content.length < 1) return;
              	  
                    if( triggerIgnore.some(i => message.content.startsWith(i))) return;
					
					if(!fs.existsSync(`./data/serverdata/${message.guild.id}/alertSettings.json`)) {
            	if(!fs.existsSync(`./data/serverdata/${message.guild.id}`)) {
            		fs.mkdirSync(`./data/serverdata/${message.guild.id}`)
            	}
                fs.writeFile(`./data/serverdata/${message.guild.id}/alertSettings.json`, dASM, function(err) {
                	if(err) return message.channel.send(strings.error.unexpected + err)
                })
            }
					
					var chatChannel = client.channels.find(channel => channel.id == nChannel.id)
					
					if(!message.guild.me.hasPermission("SEND_MESSAGES")) return; // Checks to see if CleverBot can send messages in the guild
					if(!chatChannel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) return; // Checks to see if CleverBot can send messages in the bound channel
					
					try {
					
                    message.channel.startTyping()

					} catch (ex) {
						return;
					}
                    if (sessionerr) return message.channel.send(message.author.toString() + ', sorry but an unexpected error occured... ' + err).then(msg => {
                        msg.channel.stopTyping()
                    })
                    
                    try {
                    clever.ask(message.content, function (err, response) {

                        if(err) return message.channel.send(strings.error.unexpected + err).then(msg => {
                            msg.channel.stopTyping()
                        })
                        if (!fs.existsSync(`./data/serverdata/${message.guild.id}`)) {
                            fs.mkdirSync(`./data/serverdata/${message.guild.id}`)
                        }
                        if (!fs.existsSync(`./data/serverdata/${message.guild.id}/channel.json`)) {
                            fs.writeFileSync(`./data/serverdata/${message.guild.id}/channel.json`, dCM, function (err) {
                                if(err) return message.channel.send(strings.error.unexpected + err).then(msg => {
                                    msg.channel.stopTyping()
                                })
                            })
                        }
                        
                        var logObj = {
                            message: message.content,
                            authorID: message.author.id,
                            response: response,
                            channel: message.channel.type,
                        }

                        var content = JSON.stringify(logObj, null, 2)
						
						fs.readFile(`./data/src/announcement.json`, function (err, announcementDat) {
                                    if(err) return message.channel.send(strings.error.unexpected + err)

                                    var announcementObj = JSON.parse(announcementDat)
                                    
						function sendResponse(msg, response, announcement) {
										
										 var maintenanceAlert = new Discord.RichEmbed()
                                    	.setColor(announcement.maintenance.color)
                                    	.setTitle(announcement.maintenance.title)
                                    	.setDescription(announcement.maintenance.notice)
                                    	.setFooter(announcement.maintenance.footer)
                                    	
                                    	var supportTheBotReminder = new Discord.RichEmbed()
                                    	.setColor(announcement.support.color)
                                    	.setTitle(announcement.support.title)
                                    	.setDescription(announcement.support.desc)
                                    	.setURL(announcement.support.url)
                                    	.setFooter(announcement.support.footer)
                                    	
                                    	
                                    	var skipPatreon = false
                                    	var skipMA = false
                                    	
										fs.readFile(`./data/serverdata/${message.guild.id}/alertSettings.json`, 'utf8', function(err, alertSettings) {
    									if(err) return message.channel.send(strings.error.unexpected + err)
    									
    									try {
    									var g = null
    									if (/^[\],:{}\s]*$/.test(alertSettings.replace(/\\["\\\/bfnrtu]/g, '@').
											replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
											replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
											g = true
											}else{
											g = false
											  message.channel.send(strings.error.corruptDBFile)
												return fs.unlink(`./data/serverdata/${message.guild.id}/alertSettings.json`)
											}
										} catch (ex) {
										}
    									
    									alertSettings = JSON.parse(alertSettings)
    									
    									if(alertSettings.disablePatreon == true) {
    										skipPatreon = true
    									}
    									if(alertSettings.disableMaintenance == true) {
    										skipMA = true
    									}
    									
    									
    									function defaultResponse() {
    										msg.channel.send(`**${msg.author.tag}**, ${response}`).then(msg => {
												msg.channel.stopTyping()
											})
											return;
    									}
    									function patreonResponse() {
    									if(Math.random() > 0.85) {
    										return msg.channel.send(`**${msg.author.tag}**, ${response}`, {embed: supportTheBotReminder}).then(msg => {
													msg.channel.stopTyping()
											})
											
											}
											defaultResponse()
    									}
    									function maintenanceResponse() {
    									
    									if(Math.random() > 0.75) {
    										msg.channel.send(`**${msg.author.tag}**, ${response}`, {embed: maintenanceAlert}).then(msg => {
													msg.channel.stopTyping()
											})
											return;
											}
											patreonResponse()
    									}
    			
										if(announcement.maintenance.active == false && skipPatreon == false) return patreonResponse()
										if(announcement.maintenance.active == false && skipPatreon == true) return defaultResponse()
										if(skipMA == true && skipPatreon == true) return defaultResponse()
										if(skipMA == false && skipPatreon == true && announcement.maintenance.ative == true) return maintenanceResponse()
										if(announcement.maintenance.active == true && skipMA == false) return maintenanceResponse()
										return defaultResponse()
										
										});
						}
						return sendResponse(message, response, announcementObj);
						
						});
						return;
						
						
						// End
						});	
						return;
						} catch (ex) {
							return message.channel.send(strings.error.unexpected + ex)
						}
						return;
					});
				}		
            }
            });
    /* Commands */
    client.on("guildCreate", (guild) => {

        if (!fs.existsSync(`./data/serverdata/${guild.id}`)) {
            fs.mkdirSync(`./data/serverdata/${guild.id}`)
        }
        if (!fs.existsSync(`./data/serverdata/${guild.id}/channel.json`)) {
            fs.writeFileSync(`./data/serverdata/${guild.id}/channel.json`, dCM, function (err) {
                if (err) return console.log(strings.error.unexpected + err)
            })
        }
        // Greeting Message
        fs.readFile(`./data/guildCount`, 'utf8', function(err, guildCount) {
            	if(err) return console.log(err)
            
        var greeting = new Discord.RichEmbed()
            .setColor(color)
            .setTitle('CleverBot, a simple AI Chat Bot for Discord')
            .setDescription('Thanks for inviting me to your Discord Server. I span ' + guildCount + ' servers, and am growing every single day.\n\n**Getting Started**\nTo get started use the bind command `(` <@' + client.user.id + '> `bind #channel` `)` to bind me to a channel. After that you can start chatting with me in the specific channel. You can use the command again if you ever wish to change channels.\n\n' + 
                            '**About CleverBot Privacy**\nIf you have any privacy concerns you can read over my privacy `(` <@' + client.user.id + '> `privacy` `)`.\n\n' +
                            '**Support**\nSend any complaints, suggestions, or give a pat on the back to the developer `(` <@' +client.user.id+ '> `support` `)`.\n\n')
           .addField('Website', `[CleverBot Website](${strings.links.cleverbot})`, true)
            .addField('Invite', `[CleverBot Invite](${strings.links.invite.bot.cleverbot})`, true)
            .addField('Support Server', `[CleverBot Support Server](${strings.links.invite.discord.cleverbot})`, true)
            .addField('Contact Info', `[Contact the Developer](${strings.links.cleverbot}#contact)`, true)
             .setAuthor(client.user.username, client.user.displayAvatarURL)
            
        try {
            const channel = getDefaultChannel(guild);
            channel.send({embed: greeting});
        } catch (ex) {

        }
        })
            
    })
    client.on("guildDelete", (guild) => {
        if (fs.existsSync(`./data/serverdata/${guild.id}`)) {
            fse.remove(`./data/serverdata/${guild.id}`)
        }
    })
    client.on("error", (error) => {
        console.log(error)
    })
    
    client.on("disconnect", () => {
	setTimeout(() => {
		client.user || (
			client.login(config.token)
		);
	}, 15000);
})
}); // End of CleverBot Init

client.login(config.token) //Login