const Discord = require("discord.js");

module.exports = {
        komut: "yardım",
        açıklama: "Tüm komutları listeler.",
        kategori: "genel",
        alternatifler: ["y", "help"],
        kullanım: "yardım [<komut adı>]",
        
        args: [
            {
                anahtar: 'komut',
                soru: 'Botta bulunan bir komutun adını yazınız.',
                tip: 'komut',
                varsayılan: 'hepsi'
            }
        ]
};


module.exports.baslat = async (client, message, args) => {

    if (args.komut === 'hepsi') {
    const yardim = {}
    client.kayıt.komutlar.forEach((cmd) => {
        const k = cmd.kategori;
        if (!yardim.hasOwnProperty(k)) yardim[k] = [];
        const cmds = Array.from(client.kayıt.komutlar.filter(c => c.kategori === k).keys())
        const longest = cmds.reduce((long, str) => Math.max(long, str.length), 0);
        yardim[k].push(`${cmd.komut}${' '.repeat(longest - cmd.komut.length)} :: ${cmd.açıklama}`);
    })

    let str = ''
    for (var k in yardim) {
        str += `= ${client.kayıt.kategoriler.get(k).toString().charAt(0).toUpperCase() + client.kayıt.kategoriler.get(k).toString().slice(1)} =\n ${yardim[k].join(' \n ')} \n\n`
    }

    var mr = await message.reply("Komutlarımı özel mesaj olarak gönderdim!")
    message.author.send("```asciidoc\n"+str+"\n```", {split: true})
    .catch(() => { mr.edit("Komutlarımı sana özel mesaj olarak gönderemiyorum! Sanırım özel mesajların kapalı veya beni engelledin!") })
   } else if (args.komut !== 'hepsi') {
       var komut = args.komut
       if (client.kayıt.komutlar.has(komut) === false && client.kayıt.alternatifler.has(komut) === false) {
        var embed = new Discord.RichEmbed()
        .setColor("#FF0000")
        .setDescription(`Botta \`${komut}\` adlı bir komut bulunmuyor! Botun tüm komutlarını \`${client.ayarlar.prefix}yardım\` yazarak görebilirsin.`)
        return message.channel.send({embed:embed})
       }

       var cmd = client.kayıt.komutlar.get(komut) || client.kayıt.komutlar.get(client.kayıt.alternatifler.get(komut))

       var yetki = ""
       if (typeof cmd.yetki === "number") {
       var yetki = cmd.yetki.toString()
       .replace(0, 'Yetki gerekmiyor')
       .replace(1, 'Mesajları Yönet yetkisi gerekiyor')
       .replace(2, 'Üyeleri At yetkisi gerekiyor')
       .replace(3, 'Üyeleri Yasakla yetkisi gerekiyor')
       .replace(4, 'Yönetici yetkisi gerekiyor')
       .replace(5, 'Bot yapımcısı olmak gerekiyor')
       } else {
         var yetki = cmd.yetki || "Yetki gerekmiyor"
       }

       var embed = new Discord.RichEmbed()
       .setColor("DARKBLUE")
       .addField("Komut", cmd.komut)
       .addField("Açıklama", cmd.açıklama)
       .addField("Kategori", client.kayıt.kategoriler.get(cmd.kategori))
       .addField("Gerekli Yetki", yetki+".")
       .addField("Doğru Kullanım", `\`${client.ayarlar.prefix}${cmd.kullanım}\``)
       .addField("Alternatifler", cmd.alternatifler.join(', '))
       message.channel.send({embed:embed})
   }

};
