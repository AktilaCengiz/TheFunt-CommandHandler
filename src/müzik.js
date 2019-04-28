const Discord = require('discord.js');
const { RichEmbed } = require('discord.js');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const youtube = new YouTube('AIzaSyDSiyHBWZI9dDZBWXloNVhrHbpzTTfa0L8');
const queue = new Map();

class Müzik {
    constructor(client, msg) {
        this.client = client;
        this.message = msg;

        this.oynat = this.constructor.oynat;
        this.durdur = this.constructor.durdur;
        this.geç = this.constructor.geç;
        this.kuyruk = this.constructor.kuyruk;
        this.duraklat = this.constructor.duraklat;
        this.devamet = this.constructor.devamet;
        this.tekrar = this.constructor.tekrar;
        this.ses = this.constructor.ses;
    };

static async oynat(şarkı) {
    var aramaYazisi = şarkı;
    var url = şarkı ? şarkı.replace(/<(.+)>/g, '$1') : '';
    var serverQueue = queue.get(this.message.guild.id);

    var voiceChannel = this.message.member.voiceChannel;

    const embed = new RichEmbed()
    .setColor("RANDOM")
    .setDescription("Dinlemek istediğin şarkıyı yazmalısın! (Şarkı ismi veya Youtube URLsi)")
    if (!şarkı) return this.message.channel.send(embed);
        
    const err1 = new RichEmbed()
    .setColor("RANDOM")
    .setDescription(`Lütfen herhangi bir sesli kanala katılınız.`)  
    if (!this.message.member.voiceChannel) return this.message.channel.send(err1);

    var permissions = voiceChannel.permissionsFor(this.client.user);
    if (!permissions.has('CONNECT')) {
      const warningErr = new RichEmbed()
      .setColor("RANDOM")
      .setDescription(`Herhangi bir sesli kanala katılabilmek için yeterli iznim yok.`)
      return this.message.channel.send(warningErr);
    }
    if (!permissions.has('SPEAK')) {
      const musicErr = new RichEmbed()
      .setColor("RANDOM")
      .setDescription(`Müzik açamıyorum/şarkı çalamıyorum çünkü kanalda konuşma iznim yok veya mikrofonum kapalı.`)
      return this.message.channel.send(musicErr);
    }
      if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      var playlist = await youtube.getPlaylist(url);
      var videos = await playlist.getVideos();
      for (const video of Object.values(videos)) {
        var video2 = await youtube.getVideoByID(video.id);
        await handleVideo(video2, this.message, voiceChannel, true);
      }
      const PlayingListAdd = new RichEmbed()
      .setColor("RANDOM")
      .setDescription(`[${playlist.title}](https://www.youtube.com/watch?v=${playlist.id}) adlı şarkı oynatma listesine Eklendi!`)
      return this.message.channel.send(PlayingListAdd);
    } else {
      try {
        var video = await youtube.getVideo(url);
      } catch (error) {
      try {
          var videos = await youtube.searchVideos(aramaYazisi, 10);
          
          var r = 1
        
          var video = await youtube.getVideoByID(videos[r - 1].id);
        } catch (err) {
          console.error(err);
          const songNope = new RichEmbed()
          .setColor("RANDOM")
          .setDescription(`Aradığınız isimde bir şarkı bulunamadı!`) 
          return this.message.channel.send(songNope);
        }
      }
      return handleVideo(video, this.message, voiceChannel);
    }

    async function handleVideo(video, message, voiceChannel, playlist = false) {
        var serverQueue = queue.get(message.guild.id);
        
        var song = {
          id: video.id,
          title: video.title,
          durationh: video.duration.hours,
          durationm: video.duration.minutes,
          durations: video.duration.seconds,
          url: `https://www.youtube.com/watch?v=${video.id}`,
          thumbnail: `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`,
          requester: message.author.tag,
        };
        if (!serverQueue) {
          var queueConstruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 3,
            playing: true
          };
          queue.set(message.guild.id, queueConstruct);
      
          queueConstruct.songs.push(song);
      
          try {
            var connection = await voiceChannel.join();
            queueConstruct.connection = connection;
            play(message.guild, queueConstruct.songs[0]);
          } catch (error) {
            console.error(`Ses kanalına giremedim HATA: ${error}`);
            queue.delete(message.guild.id);
            return message.channel.send(`Ses kanalına giremedim HATA: ${error}`);
          }
        } else {
          serverQueue.songs.push(song);
          
          if (playlist) return undefined;
      
          const songListBed = new RichEmbed()
          .setColor("RANDOM")
          .setDescription(`[${song.title}](https://www.youtube.com/watch?v=${song.id}) adlı şarkı kuyruğa eklendi!`)
          return message.channel.send(songListBed);
        }
        return undefined;
      }
        function play(guild, song) {
        var serverQueue = queue.get(guild.id);
      
        if (!song) {
          serverQueue.voiceChannel.leave();
          voiceChannel.leave();
          queue.delete(guild.id);
          return;
        }
      
        const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
          .on('end', reason => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
          })
          .on('error', error => console.error(error));
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
        
        let y = ''
        if (song.durationh === 0) {
            y = `${song.durationm || 0}:${song.durations || 0}`
        } else {
            y = `${song.durationh || 0}:${song.durationm || 0}:${song.durations || 0}`
        }

        const playingBed = new RichEmbed()
        .setColor("RANDOM")
        .setAuthor(`Şimdi Oynatılıyor`, song.thumbnail)
        .setDescription(`[${song.title}](${song.url})`)
        .addField("Şarkı Süresi", `${y}`, true)
        .addField("Şarkıyı Açan Kullanıcı", `${song.requester}`, true)
        .setThumbnail(song.thumbnail)
        serverQueue.textChannel.send(playingBed);
      } 
};

static async durdur() {
  var serverQueue = queue.get(this.message.guild.id);

  var voiceChannel = this.message.member.voiceChannel;
      
  const err1 = new RichEmbed()
  .setColor("RANDOM")
  .setDescription(`Bir sesli kanalda değilsin.`)  
  if (!this.message.member.voiceChannel) return this.message.channel.send(err1);
  const err2 = new RichEmbed()
  .setColor("RANDOM")
  .setDescription(`Şuanda herhangi bir şarkı çalmıyor.`)
  if (!serverQueue) return this.message.channel.send(err2);
  serverQueue.songs = [];
  const songEnd = new RichEmbed()
  .setColor("RANDOM")
  .setDescription(`Şarkı başarıyla durduruldu ve odadan ayrıldım!`)
  serverQueue.connection.dispatcher.end('');
  this.message.channel.send(songEnd);
};

static async geç() {
  var serverQueue = queue.get(this.message.guild.id);

    var voiceChannel = this.message.member.voiceChannel;
        
    const err0 = new RichEmbed()
      .setColor("RANDOM")
      .setDescription(`Bir sesli kanalda değilsin.`) 
    if (!this.message.member.voiceChannel) return this.message.channel.send(err0);
    const err05 = new RichEmbed()
    .setColor("RANDOM")
    .setDescription(`Şuanda herhangi bir şarkı çalmıyor.`)
    if (!serverQueue) return this.message.channel.send(err05);
    const songSkip = new RichEmbed()
    .setColor("RANDOM")
    .setDescription(`Şarkı başarıyla geçildi!`)
    serverQueue.connection.dispatcher.end('');
    this.message.channel.send(songSkip)
};

static async kuyruk() {
  var serverQueue = queue.get(this.message.guild.id);

    var voiceChannel = this.message.member.voiceChannel;
        
    var siralama = 0;
    const a = new RichEmbed()
  .setColor("RANDOM")
  .setDescription(`Bir sesli kanalda değilsin.`)  
if (!this.message.member.voiceChannel) return this.message.channel.send(a);
const b = new RichEmbed()
.setColor("RANDOM")
.setDescription(`Şuanda herhangi bir şarkı çalmıyor.`)
if (!serverQueue) return this.message.channel.send(b);
    
var k = serverQueue.songs.map(song => `${++siralama} - [${song.title}](https://www.youtube.com/watch?v=${song.id})`).join('\n').replace(serverQueue.songs[0].title, `**${serverQueue.songs[0].title}**`)
    
const kuyruk = new Discord.RichEmbed()
.setColor("RANDOM")
.addField("Şarkı Kuyruğu", k)
return this.message.channel.send(kuyruk)
};

static async duraklat() {
  var serverQueue = queue.get(this.message.guild.id);

    var voiceChannel = this.message.member.voiceChannel;
        
    const a = new RichEmbed()
    .setColor("RANDOM")
    .setDescription(`Bir sesli kanalda değilsin.`)  
  if (!this.message.member.voiceChannel) return this.message.channel.send(a)

  if (serverQueue && serverQueue.playing) {
    serverQueue.playing = false;
    serverQueue.connection.dispatcher.pause();
        const asjdhsaasjdhaadssad = new RichEmbed()
    .setColor("RANDOM")
    .setDescription(`Şarkı başarıyla duraklatıldı!`)
      return this.message.channel.send(asjdhsaasjdhaadssad);
    }
    const b = new RichEmbed()
    .setColor("RANDOM")
    .setDescription(`Şuanda herhangi bir şarkı çalmıyor.`)
    if (!serverQueue) return this.message.channel.send(b);
};

static async devamet() {
  var serverQueue = queue.get(this.message.guild.id);

  var voiceChannel = this.message.member.voiceChannel;
      
  const a = new RichEmbed()
  .setColor("RANDOM")
  .setDescription(`Bir sesli kanalda değilsin.`)  
if (!this.message.member.voiceChannel) return this.message.channel.send(a)

  if (serverQueue && !serverQueue.playing) {
      serverQueue.playing = true;
      serverQueue.connection.dispatcher.resume();
      const asjdhsaasjdhaadssad = new RichEmbed()
  .setColor("RANDOM")
  .setDescription(`Şarkı başarıyla devam ettiriliyor...`)
    return this.message.channel.send(asjdhsaasjdhaadssad);
  }
  const b = new RichEmbed()
  .setColor("RANDOM")
  .setDescription(`Şuanda herhangi bir şarkı çalmıyor.`)
  if (!serverQueue) return this.message.channel.send(b);
};

static async tekrar() {
  var serverQueue = queue.get(this.message.guild.id);

    var voiceChannel = this.message.member.voiceChannel;
        
    const e = new RichEmbed()
    .setColor("RANDOM")
    .setDescription(`Bir sesli kanalda değilsin.`) 
  if (!this.message.member.voiceChannel) return this.message.channel.send(e);
  const p = new RichEmbed()
  .setColor("RANDOM")
  .setDescription(`Şuanda herhangi bir şarkı çalmıyor.`)
  if (!serverQueue) return this.message.channel.send(p);
      
  var u = serverQueue.songs[0]
      
    var vi2 = await youtube.getVideoByID(u.id);
    await handleVideo(vi2, this.message, voiceChannel, true);
  const PlayingListAdd = new RichEmbed()
  .setColor("RANDOM")
  .setDescription(`[${u.title}](https://www.youtube.com/watch?v=${u.id}) adlı şarkı bitince tekrar oynatılacak!`)
  return this.message.channel.send(PlayingListAdd);

  async function handleVideo(video, message, voiceChannel, playlist = false) {
    var serverQueue = queue.get(message.guild.id);
    
    var song = {
      id: video.id,
      title: video.title,
      durationh: video.duration.hours,
      durationm: video.duration.minutes,
      durations: video.duration.seconds,
      url: `https://www.youtube.com/watch?v=${video.id}`,
      thumbnail: `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`,
      requester: message.author.tag,
    };
    if (!serverQueue) {
      var queueConstruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 3,
        playing: true
      };
      queue.set(message.guild.id, queueConstruct);
  
      queueConstruct.songs.push(song);
  
      try {
        var connection = await voiceChannel.join();
        queueConstruct.connection = connection;
        play(message.guild, queueConstruct.songs[0]);
      } catch (error) {
        console.error(`Ses kanalına giremedim HATA: ${error}`);
        queue.delete(message.guild.id);
        return message.channel.send(`Ses kanalına giremedim HATA: ${error}`);
      }
    } else {
      serverQueue.songs.push(song);
      
     if(playlist) return undefined;
  
      const songListBed = new RichEmbed()
      .setColor("RANDOM")
      .setDescription(`[${song.title}](https://www.youtube.com/watch?v=${song.id}) adlı şarkı kuyruğa eklendi!`)
      return message.channel.send(songListBed);
    }
    return undefined;
  }
    function play(guild, song) {
    var serverQueue = queue.get(guild.id);
  
    if (!song) {
      serverQueue.voiceChannel.leave();
      voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }
  
    const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
      .on('end', reason => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      })
      .on('error', error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    
    let y = ''
    if (song.durationh === 0) {
        y = `${song.durationm || 0}:${song.durations || 0}`
    } else {
        y = `${song.durationh || 0}:${song.durationm || 0}:${song.durations || 0}`
    }

    const playingBed = new RichEmbed()
    .setColor("RANDOM")
    .setAuthor(`Şimdi Oynatılıyor`, song.thumbnail)
    .setDescription(`[${song.title}](${song.url})`)
    .addField("Şarkı Süresi", `${y}`, true)
    .addField("Şarkıyı Açan Kullanıcı", `${song.requester}`, true)
    .setThumbnail(song.thumbnail)
    serverQueue.textChannel.send(playingBed);
  }
};

static async ses(ses) {
  var serverQueue = queue.get(this.message.guild.id);

    var voiceChannel = this.message.member.voiceChannel;
        
    const asd1 = new RichEmbed()
      .setColor("RANDOM")
      .setDescription(`Bir sesli kanalda değilsin.`)  
    if (!this.message.member.voiceChannel) return this.message.channel.send(asd1);
    const asd2 = new RichEmbed()
    .setColor("RANDOM")
    .setDescription(`Şuanda herhangi bir şarkı çalmıyor.`)
    if (!serverQueue) return this.message.channel.send(asd2);

    if (!ses) return this.message.reply("Ses seviyesi ayarlamak için bir sayı yazmalısın!");
    if (isNaN(ses)) return this.message.reply("Ses seviyesi ayarlamak için bir sayı yazmalısın!");
    serverQueue.volume = ses;
    if (ses > 10) return this.message.channel.send(`Ses seviyesi en fazla \`10\` olarak ayarlanabilir.`)
    serverQueue.connection.dispatcher.setVolumeLogarithmic(ses / 5);
    const volumeLevelEdit = new RichEmbed()
    .setColor("RANDOM")
    .setDescription(`Ayarlanan Ses Seviyesi: **${ses}**`)
    return this.message.channel.send(volumeLevelEdit);  
};

};

module.exports = Müzik;