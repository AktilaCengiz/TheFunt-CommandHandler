const Discord = require('discord.js');
const clientT = new Discord.Client();
const fs = require('fs');
const chalk = require('chalk');
const db = require('./veritabanı.js');
const mz = require('./müzik.js');

const mesajlar = {
    hatalar: {
        token: chalk.redBright("Maalesef, token bilginiz yanlış gözüküyor, düzelttikten sonra tekrar deneyiniz."),
        ayarlar: chalk.redBright("Lütfen Discord botunuzun {x} bilgisini yazdıgınıza emin olunuz.")
    }
};

class TheFuntClient extends Discord.Client {
    constructor(ayarlar) {
      super(ayarlar);

        this.kayıt = {};
        this.kayıt.komutlar = new Discord.Collection();
        this.kayıt.alternatifler = new Discord.Collection();
        this.kayıt.kategoriler = new Discord.Collection();
        this.kayıt.kategoriArray = '';

        if (!ayarlar.token || ayarlar.token === "") return console.log(mesajlar.hatalar.ayarlar.replace('{x}', 'token bilgisini'));
        if (!ayarlar.prefix || ayarlar.prefix === "") return console.log(mesajlar.hatalar.ayarlar.replace('{x}', 'prefix\'ini'));
        if (!ayarlar.komutDosya || ayarlar.komutDosya === "") return console.log(mesajlar.hatalar.ayarlar.replace('{x}', 'komutlarının olacağı klasörü ( "klasör adı" biçiminde olacak şekilde )'));
        if (ayarlar.varsayılanKomutlar !== undefined && ayarlar.varsayılanKomutlar !== 'hepsi' && Array.isArray(ayarlar.varsayılanKomutlar) === false) return console.log(chalk.redBright("Kapatılacak varsayılan komutları \"Array\" biçiminde yazınız. Hepsi kapatılacak ise `varsayılanKomutar: 'hepsi'` yazınız."))

        this.ayarlar = {};
        this.ayarlar.token = ayarlar.token;
        this.token = ayarlar.token;
        this.ayarlar.prefix = ayarlar.prefix;
        this.prefix = ayarlar.prefix;
        this.ayarlar.sahip = ayarlar.sahip || [];
        this.ayarlar.komutDosya = ayarlar.komutDosya;
        
        if (ayarlar.everyoneKapat) {
          ayarlar.disableEveryone = ayarlar.everyoneKapat;
          this.ayarlar.everyoneKapat = ayarlar.everyoneKapat;
        }
      
        this.varsayılanKomutlarFiltre = ayarlar.varsayılanKomutlar ? ayarlar.varsayılanKomutlar : null;

        this.veritabanı = ayarlar.veritabanı ? new db(ayarlar.veritabanı.dosya) : null;
      
        this.event = super.on;
        this.eventTest = super.emit;
      
      this.on("ready", () => {
        this.emit("hazır");
      });
      
      this.on("message", msg => {
        this.emit("mesaj", msg);
        
        msg.gönder = async function gönder(mesaj, ayarlar) {
          let kanal = "";
          let m = "";
          if (ayarlar && ayarlar.kanal) {
            kanal = msg.guild.channels.get(ayarlar.kanal) || msg.guild.channels.find(c=>c.name===ayarlar.kanal);
          if (!kanal) throw Error(`${msg.guild.name} adlı sunucuda ${ayarlar.kanal} adında/ID'inde bir kanal bulunmuyor.`);
          } else {
            kanal = msg.channel;
          }
          if (ayarlar && ayarlar.embed) {
            let embed = new Discord.RichEmbed()
            .setColor(ayarlar.embed.renk ? ayarlar.embed.renk : (ayarlar.embed.color ? ayarlar.embed.color : ""))
            if (ayarlar.embed.başlık || ayarlar.embed.author) {
              embed.setAuthor(ayarlar.embed.başlık || ayarlar.embed.author)
            }
              embed.setDescription(mesaj)
            if (ayarlar.embed.alanlar || ayarlar.embed.fields) {
              if (ayarlar.embed.alanlar) {
              ayarlar.embed.alanlar.forEach(a => {
                embed.addField(a.başlık || a.author, a.açıklama || a.value || a.description)
              })
              } else if (ayarlar.embed.fields) {
               ayarlar.embed.fields.forEach(a => {
                  embed.addField(a.başlık || a.author, a.açıklama || a.value || a.description)
                })
              }
            }
            if (ayarlar.embed.altbilgi || ayarlar.embed.footer) {
              embed.setFooter(ayarlar.embed.altbilgi || ayarlar.embed.footer)
            }
            if (ayarlar.embed.resim || ayarlar.embed.image) {
              embed.setImage(ayarlar.embed.resim || ayarlar.embed.image)
            }
            if (ayarlar.embed.küçükResim || ayarlar.embed.thumbnail) {
              embed.setThumbnail(ayarlar.embed.küçükResim || ayarlar.embed.thumbnail)
            }
            if (ayarlar.embed.zamanDamgası || ayarlar.embed.timeStamp) {
              embed.setTimestamp()
            }
            m = embed;
          } else {
            m = mesaj;
          }
          let gönderilenMesaj = await kanal.send(m)
          return gönderilenMesaj
        };
      });
      
      this.on("guildCreate", guild => {
        this.emit("sunucuyaEklendi", guild);
      });
      
      this.on("guildDelete", guild => {
        this.emit("sunucudanAtıldı", guild);
      });
      
      this.on("guildMemberAdd", member => {
        this.emit("üyeKatıldı", member);
      });
      
      this.on("guildMemberRemove", member => {
        this.emit("üyeAyrıldı", member);
      });
      
      this.on("guildBanAdd", (guild, user) => {
        this.emit("üyeYasaklandı", guild, user);
      });
      
      this.on("guildBanRemove", (guild, user) => {
        this.emit("üyeYasağıKaldırıldı", guild, user);
      });
      
      this.on("messageCreate", message => {
        this.emit("mesajGönderildi", message);
      });
      
      this.on("messageUpdate", (oldMsg, newMsg) => {
        this.emit("mesajDüzenlendi", oldMsg, newMsg);
      });
      
      this.on("messageDelete", message => {
        this.emit("mesajSilindi", message);
      });
      
      this.on("channelCreate", channel => {
        this.emit("kanalOluşturuldu", channel);
      });
      
      this.on("channelDelete", channel => {
        this.emit("kanalSilindi", channel);
      });
      
      this.on("channelUpdate", channel => {
        this.emit("kanalDüzenlendi", channel);
      });
      
      this.on("messageReactionAdd", (reaction, user) => {
        this.emit("tepkiEklendi", reaction, user);
      });
      
      this.on("messageReactionRemove", (reaction, user) => {
        this.emit("tepkiKaldırıldı", reaction, user);
      });
      
      this.on("mesaj", async msg => {

            this.veritabanı.ayarla = await this.veritabanı.ayarla;
            this.veritabanı.veri = await this.veritabanı.veri;
            this.veritabanı.ekle = await this.veritabanı.ekle;
            this.veritabanı.çıkar = await this.veritabanı.çıkar;
            this.veritabanı.arttır = await this.veritabanı.arttır;
            this.veritabanı.azalt = await this.veritabanı.azalt;
          
          this.müzik = new mz(this, msg);

            var prefixx =  this.ayarlar.prefix;
            if (this.veritabanı !== null || this.veritabanı !== undefined) {
                if (msg.guild) {
                    var prefixx = this.veritabanı.veri(`${msg.guild.id}.prefix`) || this.ayarlar.prefix;
                };
            };
            const prefixMention = new RegExp(`^<@!?${this.user.id}> `);
            const prefix = msg.content.match(prefixMention) ? msg.content.match(prefixMention)[0] : prefixx;
            
            if(!msg.content.startsWith(prefix)) return;
            let arg = msg.content.slice(prefix.length).trim().split(/ +/g);
            var command = arg.shift().toLowerCase();
            
            let cmd = this.kayıt.komutlar.get(command) || this.kayıt.komutlar.get(this.kayıt.alternatifler.get(command));
            if(!cmd) return;

            if (cmd.yetki) {
              
              if (typeof cmd.yetki === "number") {
                console.log(`${chalk.redBright("UYARI:")} Bir sonraki sürümde sayı ile belirtilen komut yetkileri tamamen kaldırılacaktır. Kaldırıldığın da nasıl yapacağınızı bilmiyorsanız öğrenmek için https://discord.gg/erW5NWV Discord adresini ziyaret edebilir veya https://www.npmjs.com/package/discordjs-advanced adresini inceleyebilirsiniz.`);
                if (cmd.yetki === 1) {
                  if (!msg.member.hasPermission("MANAGE_MESSAGES")) {
                    msg.reply("Üzgünüm! Bu komutu kullanabilmek için `Mesajları Yönet` iznine sahip olmalısın.")
                    return
                  }
                }
                if (cmd.yetki === 2) {
                  if (!msg.member.hasPermission("KICK_MEMBERS")) {
                    msg.reply("Üzgünüm! Bu komutu kullanabilmek için `Üyeleri At` iznine sahip olmalısın.")
                    return
                  }
                }
                if (cmd.yetki === 3) {
                  if (!msg.member.hasPermission("BAN_MEMBERS")) {
                    msg.reply("Üzgünüm! Bu komutu kullanabilmek için `Üyeleri Yasakla` iznine sahip olmalısın.")
                    return
                  }
                }
                if (cmd.yetki === 4) {
                  if (!msg.member.hasPermission("ADMINISTRATOR")) {
                    msg.reply("Üzgünüm! Bu komutu kullanabilmek için `Yönetici` iznine sahip olmalısın.")
                    return
                  }
                }
                if (cmd.yetki === 5) {
                  let s = await super.fetchApplication();
                  let ss = this.ayarlar.sahip;
                  if (ss.includes(s.owner.id) === false) {
                    ss.push(s.owner.id);
                  }
                  this.ayarlar.sahip = ss;
                  if (ss.includes(msg.author.id) === false) {
                    msg.reply("Üzgünüm! Bu komutu kullanabilmek için `Botun Sahibi` olmalısın.")
                    return
                  }
                }
              };
              
              if (typeof cmd.yetki !== "number") {
                if (cmd.yetki === "BOT_OWNER") {
                  let s = await super.fetchApplication();
                  let ss = this.ayarlar.sahip;
                  if (ss.includes(s.owner.id) === false) {
                    ss.push(s.owner.id);
                  }
                  this.ayarlar.sahip = ss;
                  if (ss.includes(msg.author.id) === false) {
                    msg.reply("Üzgünüm! Bu komutu kullanabilmek için `Bot Sahibi/Geliştiricisi` olmalısın.")
                    return
                  }
                }
                if (cmd.yetki !== "BOT_OWNER") {
                  if (!msg.member.hasPermission(cmd.yetki)) {
                    msg.reply("Üzgünüm! Bu komutu kullanabilmek için `"+cmd.yetki+"` iznine sahip olmalısın.")
                    return
                  }
                }
              };
            };

        let content = '';
        let args = [];
        if (cmd.args && cmd.args !== null || cmd.args !== undefined) {

        let cevaps = [];
        var c = msg.content.slice(prefix.length).trim().split(/ +/g)[1];
        var cxc = msg.content.slice(prefix.length).trim().split(/ +/g);
        var val = '';
        var xxx = '';

        if (c !== undefined || c) {
            for (var i = 0; i < cmd.args.length; i++) {
                
                if (cmd.args[i].varsayılan) {
                  if (c) {
                    if (cmd.args[i].tip === 'yazi') {
                        if (cmd.args.length === 1) {
                            var c = cxc.slice(1).join(' ');
                        }
                        var c = cxc[i+1];
                    }
                    if (cmd.args[i].tip === 'sayi') {
                        var c = cxc[i+1];
                        if (isNaN(c)) return yanlışVeriYeniArgs(this, msg, cmd, 'sayı')
                    }
                    if (cmd.args[i].tip === 'kullanici') {
                        var cc = msg.guild.members.find(m=>m.user.username===cxc[i+1]) || msg.guild.members.get(cxc[i+1]) || msg.mentions.members.first();
                        if (cmd.args.length === 1) {
                            var cc = msg.guild.members.find(m=>m.user.username===cxc.slice(1).join(' ')) || msg.guild.members.get(cxc.slice(1).join(' ')) || msg.mentions.members.first();
                        }
                        if (msg.guild.members.find(m => m === cc) === null || msg.guild.members.find(m => m === cc) === undefined) return yanlışVeriYeniArgs(this, msg, cmd, 'kullanıcı')
                        var c = this.users.get(cc.id)
                    }
                    if (cmd.args[i].tip === 'kanal') {
                        if (cmd.args.length === 1) {
                            var c =  msg.guild.channels.find(c=>c.name===cxc.slice(1).join(' ')) || msg.guild.channels.get(cxc.slice(1).join(' ')) || msg.mentions.channels.first();
                        }
                        var c = msg.guild.channels.find(c=>c.name===cxc[i+1]) || msg.guild.channels.get(cxc[i+1]) || msg.mentions.channels.first();
                        if (msg.guild.channels.find(ch => ch === c) === null || msg.guild.channels.find(ch => ch === c) === undefined) return yanlışVeriYeniArgs(this, msg, cmd, 'kanal')
                    }
                    if (cmd.args[i].tip === 'rol') {
                        if (cmd.args.length === 1) {
                            var c =  msg.guild.roles.find(r=>r.name===cxc.slice(1).join(' ')) || msg.guild.roles.get(cxc.slice(1).join(' ')) || msg.mentions.roles.first();
                        }
                        var c = msg.guild.roles.find(r=>r.name===cxc[i+1]) || msg.guild.roles.get(cxc[i+1]) || msg.mentions.roles.first();
                        if (msg.guild.roles.find(r => r === c) === null || msg.guild.roles.find(r => r === c) === undefined) return yanlışVeriYeniArgs(this, msg, cmd, 'rol')
                    }
                    if (cmd.args[i].tip === 'kategori') {
                      if (cmd.args.length === 1) {
                        var c = cxc.slice(1).join(' ');
                      }
                      var c = cxc[i+1];
                      if (this.kayıt.kategoriler.has(c) === false) return yanlışVeriYeniArgs(this, msg, cmd, 'kategori')
                    }
                    if (cmd.args[i].tip === 'komut') {
                      if (cmd.args.length === 1) {
                        var c = cxc.slice(1).join(' ');
                      }
                      var c = cxc[i+1];
                     if (this.kayıt.komutlar.has(c) === false && this.kayıt.alternatifler.has(c) === false) return yanlışVeriYeniArgs(this, msg, cmd, 'komut')
                    }
                  }
                    args[cmd.args[i].anahtar] = c || cmd.args[i].varsayılan;
                    args['soru-'+Math.floor(i+1)] = cmd.args[i].soru;
                    cmd.baslat(this, msg, args, this.veritabanı)
                    return
                };

                if (cmd.args[i].tip === 'yazi') {
                  var c = cxc[i+1];
                    if (cmd.args.length === 1) {
                        var c = cxc.slice(1).join(' ');
                    }
                }
                if (cmd.args[i].tip === 'sayi') {
                    var c = cxc[i+1];
                    if (isNaN(c)) return yanlışVeriYeniArgs(this, msg, cmd, 'sayı')
                }
                if (cmd.args[i].tip === 'kullanici') {
                    var cc = msg.guild.members.find(m=>m.user.username===cxc[i+1]) || msg.guild.members.get(cxc[i+1]) || msg.mentions.members.first();
                    if (cmd.args.length === 1) {
                        var cc = msg.guild.members.find(m=>m.user.username===cxc.slice(1).join(' ')) || msg.guild.members.get(cxc.slice(1).join(' ')) || msg.mentions.members.first();
                    }
                    if (msg.guild.members.find(m => m === cc) === null || msg.guild.members.find(m => m === cc) === undefined) return yanlışVeriYeniArgs(this, msg, cmd, 'kullanıcı')
                    var c = this.users.get(cc.id)
                }
                if (cmd.args[i].tip === 'kanal') {
                    if (cmd.args.length === 1) {
                        var c =  msg.guild.channels.find(c=>c.name===cxc.slice(1).join(' ')) || msg.guild.channels.get(cxc.slice(1).join(' ')) || msg.mentions.channels.first();
                    }
                    var c = msg.guild.channels.find(c=>c.name===cxc[i+1]) || msg.guild.channels.get(cxc[i+1]) || msg.mentions.channels.first();
                    if (msg.guild.channels.find(ch => ch === c) === null || msg.guild.channels.find(ch => ch === c) === undefined) return yanlışVeriYeniArgs(this, msg, cmd, 'kanal')
                }
                if (cmd.args[i].tip === 'rol') {
                    if (cmd.args.length === 1) {
                        var c =  msg.guild.roles.find(r=>r.name===cxc.slice(1).join(' ')) || msg.guild.roles.get(cxc.slice(1).join(' ')) || msg.mentions.roles.first();
                    }
                    var c = msg.guild.roles.find(r=>r.name===cxc[i+1]) || msg.guild.roles.get(cxc[i+1]) || msg.mentions.roles.first();
                    if (msg.guild.roles.find(r => r === c) === null || msg.guild.roles.find(r => r === c) === undefined) return yanlışVeriYeniArgs(this, msg, cmd, 'rol')
                }
                 if (cmd.args[i].tip === 'kategori') {
                      if (cmd.args.length === 1) {
                        var c = cxc.slice(1).join(' ');
                      }
                      var c = cxc[i+1];
                      if (this.kayıt.kategoriler.has(c) === false) return yanlışVeriYeniArgs(this, msg, cmd, 'kategori')
                    }
                  if (cmd.args[i].tip === 'komut') {
                      if (cmd.args.length === 1) {
                        var c = cxc.slice(1).join(' ');
                      }
                      var c = cxc[i+1];
                      if (this.kayıt.komutlar.has(c) === false && this.kayıt.alternatifler.has(c) === false) return yanlışVeriYeniArgs(this, msg, cmd, 'komut')
                    }

                if (cxc[i+1] === undefined) {
                    msg.channel.send(new Discord.RichEmbed().setColor("#9b59b6").setDescription(cmd.args[i].soru).setFooter("Komut isteğini iptal etmek için \"iptal\" yazınız. \n Komut isteği otomatik olarak \"30\" saniye sonra iptal edilecektir."))
                    
                    try {

                        var collected = await msg.channel.awaitMessages(m => m.author.id === msg.author.id && m.author.id !== this.user.id && !m.author.bot, {
                            max: 1,
                            time: 30000,
                            errors: ['time']
                        });
       
                        if (collected.first()) {
                            if (collected.first().content.toLowerCase() === 'iptal') {
                              msg.channel.send(new Discord.RichEmbed().setColor("GREEN").setDescription("<:basari:503463250806177792> | Komut isteği başarılı bir şekilde iptal edildi."))
                                return
                            }
                            if (cmd.args[i].tip === 'yazi') {
                                var xxx = collected.first().content;
                            }
                            if (cmd.args[i].tip === 'sayi') {
                                var xxx = collected.first().content;
                                if (isNaN(xxx)) return yanlışVeriYeniArgs(this, msg, cmd, 'sayı')
                            }
                            if (cmd.args[i].tip === 'kullanici') {
                                var xx = msg.guild.members.find(m=>m.user.username===collected.first().content) || msg.guild.members.get(collected.first().content) || msg.guild.members.get(collected.first().content.replace("<@", "").replace("!", "").replace(">", ""));
                                if (msg.guild.members.find(m => m === xx) === null) return yanlışVeriYeniArgs(this, msg, cmd, 'kullanıcı')
                                var xxx = this.users.get(xx.id)
                            }
                            if (cmd.args[i].tip === 'kanal') {
                                var xxx = msg.guild.channels.find(c=>c.name===collected.first().content) || msg.guild.channels.get(collected.first().content) || msg.guild.channels.get(collected.first().content.replace("<#", "").replace(">", ""));
                                if (msg.guild.channels.find(c => c === xxx) === null || msg.guild.channels.find(c => c === xxx) === undefined) return yanlışVeriYeniArgs(this, msg, cmd, 'kanal')
                            }
                            if (cmd.args[i].tip === 'rol') {
                                var xxx = msg.guild.roles.find(r=>r.name===collected.first().content) || msg.guild.roles.get(collected.first().content) || msg.guild.roles.get(collected.first().content.replace("<@", "").replace("&", "").replace(">", ""));;
                                if (msg.guild.roles.find(r => r === xxx) === null || msg.guild.roles.find(r => r === xxx) === undefined) return yanlışVeriYeniArgs(this, msg, cmd, 'rol')
                            }
                            if (cmd.args[i].tip === 'kategori') {
                              var xxx = collected.first().content;
                              if (this.kayıt.kategoriler.has(xxx) === false) return yanlışVeriYeniArgs(this, msg, cmd, 'kategori')
                            }
                            if (cmd.args[i].tip === 'komut') {
                              var xxx = collected.first().content;
                              if (this.kayıt.komutlar.has(xxx) === false && this.kayıt.alternatifler.has(xxx) === false) return yanlışVeriYeniArgs(this, msg, cmd, 'komut')
                            }
                            var val = xxx;
                        }

                    } catch(err) {
                        return msg.reply(' Üzgünüm! Komut isteği süresi doldu ve komut isteği otomatik olarak iptal edildi!') 
                    }

                    content = val;

                    args[cmd.args[i].anahtar] = content;
                    args['soru-'+Math.floor(i+1)] = cmd.args[i].soru;
                };
                if (cxc[i+1] !== undefined) {
                    args[cmd.args[i].anahtar] = c;
                    args['soru-'+Math.floor(i+1)] = cmd.args[i].soru;
                };
            }
            cmd.baslat(this, msg, args, this.veritabanı)
            return
        };

        if (c === undefined || !c) {
        for (var i = 0; i < cmd.args.length; i++) {
            
            if (cmd.args[i].varsayılan) {
                if (cmd.args[i].tip === 'yazi') {
                    if (cmd.args.length === 1) {
                        var c = cxc.slice(1).join(' ');
                    }
                    var c = cxc[i+1];
                }
              if (c) {
                if (cmd.args[i].tip === 'sayi') {
                    var c = cxc[i+1];
                    if (isNaN(c)) return yanlışVeriYeniArgs(this, msg, cmd, 'sayı')
                }
                if (cmd.args[i].tip === 'kullanici') {
                    var cc = msg.guild.members.find(m=>m.user.username===cxc[i+1]) || msg.guild.members.get(cxc[i+1]) || msg.mentions.members.first();
                    if (cmd.args.length === 1) {
                        var cc = msg.guild.members.find(m=>m.user.username===cxc.slice(1).join(' ')) || msg.guild.members.get(cxc.slice(1).join(' ')) || msg.mentions.members.first();
                    }
                    if (msg.guild.members.find(m => m === cc) === null || msg.guild.members.find(m => m === cc) === undefined) return yanlışVeriYeniArgs(this, msg, cmd, 'kullanıcı')
                    var c = this.users.get(cc.id)
                }
                if (cmd.args[i].tip === 'kanal') {
                    if (cmd.args.length === 1) {
                        var c =  msg.guild.channels.find(c=>c.name===cxc.slice(1).join(' ')) || msg.guild.channels.get(cxc.slice(1).join(' ')) || msg.mentions.channels.first();
                    }
                    var c = msg.guild.channels.find(c=>c.name===cxc[i+1]) || msg.guild.channels.get(cxc[i+1]) || msg.mentions.channels.first();
                    if (msg.guild.channels.find(ch => ch === c) === null || msg.guild.channels.find(ch => ch === c) === undefined) return yanlışVeriYeniArgs(this, msg, cmd, 'kanal')
                }
                if (cmd.args[i].tip === 'rol') {
                    if (cmd.args.length === 1) {
                        var c =  msg.guild.roles.find(r=>r.name===cxc.slice(1).join(' ')) || msg.guild.roles.get(cxc.slice(1).join(' ')) || msg.mentions.roles.first();
                    }
                    var c = msg.guild.roles.find(r=>r.name===cxc[i+1]) || msg.guild.roles.get(cxc[i+1]) || msg.mentions.roles.first();
                    if (msg.guild.roles.find(r => r === c) === null || msg.guild.roles.find(r => r === c) === undefined) return yanlışVeriYeniArgs(this, msg, cmd, 'rol')
                }
                if (cmd.args[i].tip === 'kategori') {
                   if (cmd.args.length === 1) {
                     var c = cxc.slice(1).join(' ');
                   }
                   var c = cxc[i+1];
                   if (this.kayıt.kategoriler.has(c) === false) return yanlışVeriYeniArgs(this, msg, cmd, 'kategori')
                 }
                if (cmd.args[i].tip === 'komut') {
                    if (cmd.args.length === 1) {
                      var c = cxc.slice(1).join(' ');
                    }
                    var c = cxc[i+1];
                    if (this.kayıt.komutlar.has(c) === false && this.kayıt.alternatifler.has(c) === false) return yanlışVeriYeniArgs(this, msg, cmd, 'komut')
                }
              }
                args[cmd.args[i].anahtar] = c || cmd.args[i].varsayılan;
                args['soru-'+Math.floor(i+1)] = cmd.args[i].soru;
                cmd.baslat(this, msg, args, this.veritabanı)
                return
            };

        msg.channel.send(new Discord.RichEmbed().setColor("#9b59b6").setDescription(cmd.args[i].soru).setFooter("Komut isteğini iptal etmek için \"iptal\" yazınız. \n Komut isteği otomatik olarak \"30\" saniye sonra iptal edilecektir."))

        try {

        var collected = await msg.channel.awaitMessages(m => m.author.id === msg.author.id && m.author.id !== this.user.id && !m.author.bot, {
            max: 1,
            time: 30000,
            errors: ['time']
        });
       
        if (collected.first()) {
            if (collected.first().content.toLowerCase() === 'iptal') {
              msg.channel.send(new Discord.RichEmbed().setColor("GREEN").setDescription("<:basari:503463250806177792> | Komut isteği başarılı bir şekilde iptal edildi."));
                return
            }
            if (cmd.args[i].tip === 'yazi') {
                var xxx = collected.first().content;
            }
            if (cmd.args[i].tip === 'sayi') {
                var xxx = collected.first().content;
                if (isNaN(xxx)) return yanlışVeriYeniArgs(this, msg, cmd, 'sayı')
            }
            if (cmd.args[i].tip === 'kullanici') {
                var xx = msg.guild.members.find(m=>m.user.username===collected.first().content) || msg.guild.members.get(collected.first().content) || msg.guild.members.get(collected.first().content.replace("<@", "").replace("!", "").replace(">", ""));
                if (msg.guild.members.find(m => m === xx) === null) return yanlışVeriYeniArgs(this, msg, cmd, 'kullanıcı')
                var xxx = this.users.get(xx.id)
            }
            if (cmd.args[i].tip === 'kanal') {
                var xxx = msg.guild.channels.find(c=>c.name===collected.first().content) || msg.guild.channels.get(collected.first().content) || msg.guild.channels.get(collected.first().content.replace("<#", "").replace(">", ""));
                if (msg.guild.channels.find(c => c === xxx) === null || msg.guild.channels.find(c => c === xxx) === undefined) return yanlışVeriYeniArgs(this, msg, cmd, 'kanal')
            }
            if (cmd.args[i].tip === 'rol') {
                var xxx = msg.guild.roles.find(r=>r.name===collected.first().content) || msg.guild.roles.get(collected.first().content) || msg.guild.roles.get(collected.first().content.replace("<@", "").replace("&", "").replace(">", ""));;
                if (msg.guild.roles.find(r => r === xxx) === null || msg.guild.roles.find(r => r === xxx) === undefined) return yanlışVeriYeniArgs(this, msg, cmd, 'rol')
            }
            if (cmd.args[i].tip === 'kategori') {
                var xxx = collected.first().content;
                if (this.kayıt.kategoriler.has(xxx) === false) return yanlışVeriYeniArgs(this, msg, cmd, 'kategori')
            }
            if (cmd.args[i].tip === 'komut') {
                var xxx = collected.first().content;
                if (this.kayıt.komutlar.has(xxx) === false && this.kayıt.alternatifler.has(xxx) === false) return yanlışVeriYeniArgs(this, msg, cmd, 'komut')
            }
            var val = xxx;
        }

    } catch(err) {
        return  msg.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(' Üzgünüm! Komut isteği süresi doldu. Komut isteğiniz otomatik olarak iptal edildi!')) 
    }

        content = val;
        cevaps.push(content)

        args[cmd.args[i].anahtar] = cevaps[i];
        args['soru-'+Math.floor(i+1)] = cmd.args[i].soru;
    };
    cmd.baslat(this, msg, args, this.veritabanı)
    return
}

return
};

cmd.baslat(this, msg, args, this.veritabanı)

});

async function yanlışVeriYeniArgs(bot, msg, cmd, arg, content = '', args = [], cevaps = [], val = '', xxx = '') {
  for (var i = 0; i < cmd.args.length; i++) {
    msg.channel.send(new Discord.RichEmbed().setColor("#FF0000").setDescription(`Yazılan argüman bir ${arg} olmalı! Lütfen tekrar deneyiniz.`).setFooter("Komut isteğini iptal etmek için \"iptal\" yazınız. \nKomut isteği otomatik olarak \"30\" saniye sonra iptal edilecektir."))
                    
    try {

        var collected = await msg.channel.awaitMessages(m => m.author.id === msg.author.id && m.author.id !== bot.user.id && !m.author.bot, {
            max: 1,
            time: 30000,
            errors: ['time']
        });
       
        if (collected.first()) {
            if (collected.first().content.toLowerCase() === 'iptal') {
                msg.reply("Komut işlemi iptal edildi.")
                return
            }
            if (cmd.args[i].tip === 'yazi') {
                var xxx = collected.first().content;
            }
            if (cmd.args[i].tip === 'sayi') {
                var xxx = collected.first().content;
                if (isNaN(xxx)) return  msg.channel.send(new Discord.RichEmbed().setColor("#FF0000").setDescription(`Bir kez daha yanlış bir argümen yazdığınız için bilerek yaptığınızdan şüphe duyarak komut işlemini iptal ettim! Komutu tekrar kullanmanız gerekecek.`))
            }
            if (cmd.args[i].tip === 'kullanici') {
                var xx = msg.guild.members.find(m=>m.user.username===collected.first().content) || msg.guild.members.get(collected.first().content) || msg.guild.members.get(collected.first().content.replace("<@", "").replace("!", "").replace(">", ""));
                if (msg.guild.members.find(m => m === xx) === null) return  msg.channel.send(new Discord.RichEmbed().setColor("#FF0000").setDescription(`Bir kez daha yanlış bir argümen yazdığınız için bilerek yaptığınızdan şüphe duyarak komut işlemini iptal ettim! Komutu tekrar kullanmanız gerekecek.`))
                var xxx = bot.users.get(xx.id)
            }
            if (cmd.args[i].tip === 'kanal') {
                var xxx = msg.guild.channels.find(c=>c.name===collected.first().content) || msg.guild.channels.get(collected.first().content) || msg.guild.channels.get(collected.first().content.replace("<#", "").replace(">", ""));
                if (msg.guild.channels.find(c => c === xxx) === null || msg.guild.channels.find(c => c === xxx) === undefined) return  msg.channel.send(new Discord.RichEmbed().setColor("#FF0000").setDescription(`Bir kez daha yanlış bir argümen yazdığınız için bilerek yaptığınızdan şüphe duyarak komut işlemini iptal ettim! Komutu tekrar kullanmanız gerekecek.`))
            }
            if (cmd.args[i].tip === 'rol') {
                var xxx = msg.guild.roles.find(r=>r.name===collected.first().content) || msg.guild.roles.get(collected.first().content) || msg.guild.roles.get(collected.first().content.replace("<@", "").replace("&", "").replace(">", ""));;
                if (msg.guild.roles.find(r => r === xxx) === null || msg.guild.roles.find(r => r === xxx) === undefined) return  msg.channel.send(new Discord.RichEmbed().setColor("#FF0000").setDescription(`Bir kez daha yanlış bir argümen yazdığınız için bilerek yaptığınızdan şüphe duyarak komut işlemini iptal ettim! Komutu tekrar kullanmanız gerekecek.`))
            }
            if (cmd.args[i].tip === 'kategori') {
                var xxx = collected.first().content;
                if (bot.kayıt.kategoriler.has(xxx) === false) return msg.channel.send(new Discord.RichEmbed().setColor("#FF0000").setDescription(`Bir kez daha yanlış bir argümen yazdığınız için bilerek yaptığınızdan şüphe duyarak komut işlemini iptal ettim! Komutu tekrar kullanmanız gerekecek.`))
            }
            if (cmd.args[i].tip === 'komut') {
                var xxx = collected.first().content;
                if (bot.kayıt.komutlar.has(xxx) === false && bot.kayıt.alternatifler.has(xxx) === false) return msg.channel.send(new Discord.RichEmbed().setColor("#FF0000").setDescription(`Bir kez daha yanlış bir argümen yazdığınız için bilerek yaptığınızdan şüphe duyarak komut işlemini iptal ettim! Komutu tekrar kullanmanız gerekecek.`))
            }
            var val = xxx;
        }

    } catch(err) {
        return msg.reply('Üzgünüm! Komut işlemi süresi doldu ve komut işlemi otomatik olarak iptal edildi!') 
    }

    content = val;
    cevaps.push(content)

    args[cmd.args[i].anahtar] = cevaps[i];
    args['soru-'+Math.floor(i+1)] = cmd.args[i].soru;
  }
    cmd.baslat(bot, msg, args, this.veritabanı)
};

      this.on("hazır", () => {
        console.log(`${chalk.cyan("Bot")} ${chalk.blue(`${this.user.username}`)} ${chalk.yellow("(")}${chalk.blue(`${this.user.tag}`)}${chalk.yellow(")")} ${chalk.cyan("adıyla giriş yaptı")}${chalk.redBright("!")}`)
      });
      
};

    giris() {
        this.komutYükle()
        if (!this.token || this.token === "") return
        super.login(this.token).catch(err => { 
            if (err.message === 'Incorrect login details were provided.') { 
                return console.log(mesajlar.hatalar.token) 
            }
        });
    };

    kategoriYükle(veri) {
        if (Array.isArray(veri) === false) throw new TypeError('Lütfen kategoriler verisini Array biçiminde yazınız. Örneğin; `client.kategoriYükle([\n["test", "Test Komutları"]\n])`')
        this.kayıt.kategoriArray = veri
        return veri
    };

    komutYükle() {
        this.kayıt.kategoriArray.forEach((kk) => {
            var k = kk[0]
            var k2 = kk[1]
            this.kayıt.kategoriler.set(k, k2)
            fs.readdir(`${this.ayarlar.komutDosya || 'komutlar'}/${k}/`, (err, files) => {
                if(!files || files.length == 0) {
                    return
                }
                let jsfiles = files.filter(f => f.split(".").pop() === "js")
            
                if(jsfiles.length == 0) {
                    return
                } else {
                    if (err) {
                        return
                    }
                    console.log(`${chalk.grey(`${k2} kategorisinde`)} ${chalk.red(`${jsfiles.length}`)} ${chalk.yellow("tane komut yüklenecek")}${chalk.grey(".")}`)
                
                  if (this.veritabanı.varMı("kapatılmışKomutlar") === true) {
                    jsfiles.filter(f => this.veritabanı.varMı("kapatılmışKomutlar."+f.split(".")[0]) === false).forEach(f => {
                        let props = require(`${process.cwd()+'/'+this.ayarlar.komutDosya || 'komutlar'}/${k}/${f}`)
                        var cmd = props;
                        this.kayıt.komutlar.set(cmd.komut, cmd)
                        cmd.alternatifler.forEach(a => {
                            this.kayıt.alternatifler.set(a, cmd.komut)
                        })
                        console.log(`${chalk.greenBright(`${cmd.komut}`)} ${chalk.yellow("adlı komut yüklendi")}${chalk.grey(".")}`)
                    })
                  } else {
                    jsfiles.forEach(f => {
                        let props = require(`${process.cwd()+'/'+this.ayarlar.komutDosya || 'komutlar'}/${k}/${f}`)
                        var cmd = props;
                        this.kayıt.komutlar.set(cmd.komut, cmd)
                      try {
                        cmd.alternatifler.forEach(a => {
                            this.kayıt.alternatifler.set(a, cmd.komut)
                        });
                      } catch(err) {
                        return
                      };
                        console.log(`${chalk.greenBright(`${cmd.komut}`)} ${chalk.yellow("adlı komut yüklendi")}${chalk.grey(".")}`)
                    })
                  }

                }
            })
        })
        

//Varsayılan/hazır komutlar
        if (this.varsayılanKomutlarFiltre === 'hepsi') { return }
        if (this.varsayılanKomutlarFiltre !== 'hepsi') {
        var vKategoriler = [['genel', 'Genel Komutlar'], ['yapımcı', 'Bot Yapımcısı Komutları']]
        vKategoriler.forEach((kk) => {
            var k = kk[0]
            var k2 = kk[1]
            this.kayıt.kategoriler.set(k, k2)
            fs.readdir(`${__dirname}/varsayılanKomutlar/${k}/`, (err, files) => {
                let jsfiles = files.filter(f => f.split(".").pop() === "js")
            
                if(jsfiles.length == 0) {
                    return
                } else {
                    if (err) {
                        return
                    }

                if (this.varsayılanKomutlarFiltre !== null) {
                    jsfiles.filter(f => this.varsayılanKomutlarFiltre.includes(f.split(".")[0]) === false).forEach(f => {
                        let props = require(`./varsayılanKomutlar/${k}/${f}`)
                        var cmd = props;
                        this.kayıt.komutlar.set(cmd.komut, cmd)
                        cmd.alternatifler.forEach(a => {
                            this.kayıt.alternatifler.set(a, cmd.komut)
                        })
                    })
                };
                if (this.varsayılanKomutlarFiltre === null) {
                    jsfiles.forEach(f => {
                        let props = require(`./varsayılanKomutlar/${k}/${f}`)
                        var cmd = props;
                        this.kayıt.komutlar.set(cmd.komut, cmd)
                        cmd.alternatifler.forEach(a => {
                            this.kayıt.alternatifler.set(a, cmd.komut)
                        })
                    })
                };

                }
            })
          })
       }
   };

    eventYükle(dosya) {
        if (!dosya) return console.log(mesajlar.hatalar.ayarlar.replace("{x}", "ayrı event dosyasını (Örneğin: 'client.eventYükle(\"klasör adı\")')"))
        fs.readdir(`${dosya}/`, (err, files) => {
            if(!files || files.length == 0) {
                return
            }
            let jsfiles = files.filter(f => f.split(".").pop() === "js")
            if(jsfiles.length == 0) {
                return
            } else {
                if (err) {
                    return
                }
                jsfiles.forEach(f => {
                    let event = require(`${process.cwd()}/${dosya}/${f}`)
                    this.on(f.split(".")[0], event.bind(null, this))
                })

            }
        })
    };
};

module.exports = TheFuntClient;
