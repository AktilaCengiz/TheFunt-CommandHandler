const Discord = require("discord.js");

module.exports = {
        komut: "ön-ek",
        açıklama: "Botun sunucudaki ön-ek'ini değiştirmeyi sağlar.",
        kategori: "genel",
        alternatifler: ["prefix", "önek"],
        kullanım: "ön-ek [istediğiniz ön-ek]",
        yetki: "ADMINISTRATOR",
        
        args: [
            {
                anahtar: 'prefix',
                soru: 'Botun ön-ekini ne yapmak istediğinizi yazınız. \n(Ön-ek\'i sunucu içi değiştirir.)',
                tip: 'yazi'
            }
        ]
};


module.exports.baslat = async (client, message, args) => {
    
    client.veritabanı.ayarla(`${message.guild.id}.prefix`, args.prefix)

    if (args.prefix === 'varsayılan' || args.prefix === 'default') {
        if (client.veritabanı.varMı(`${message.guild.id}.prefix`) === false) return message.reply('Sunucuda özel ön-ek ayarlanmamış! Neyi sıfırlayabilirim?!')

        client.veritabanı.sil(`${message.guild.id}.prefix`)
        
        var embed = new Discord.RichEmbed()
        .setColor("DARKBLUE")
        .setDescription(`Botun sunucudaki ön-ek'i başarıyla sıfırlanarak tekrar \`${client.ayarlar.prefix}\` olarak ayarlandı!`)
        message.channel.send({embed:embed})
        return
    }

    var embed = new Discord.RichEmbed()
    .setColor("DARKBLUE")
    .setDescription(`Botun sunucudaki ön-ek'i başarıyla \`${args.prefix}\` olarak ayarlandı!`)
    message.channel.send({embed:embed})
};
