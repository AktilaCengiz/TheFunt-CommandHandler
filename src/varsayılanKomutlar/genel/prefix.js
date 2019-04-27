const Discord = require("discord.js");

module.exports = {
        komut: "prefix",
        açıklama: "Botun sunucudaki ön-ek'ini değiştirmeyi sağlar.",
        kategori: "genel",
        alternatifler: ["prefix", "önek"],
        kullanım: "prefix [istediğiniz ön-ek]",
        yetki: "ADMINISTRATOR",
        
        args: [
            {
                anahtar: 'prefix',
                soru: 'Botun prefixini ne yapmak istediğinizi yazınız. \n(Prefix\'i sadece bu sunucu içi değiştirir.)',
                tip: 'yazi'
            }
        ]
};


module.exports.baslat = async (client, message, args) => {
    
    client.veritabanı.ayarla(`${message.guild.id}.prefix`, args.prefix)

    if (args.prefix === 'varsayılan' || args.prefix === 'default') {
        if (client.veritabanı.varMı(`${message.guild.id}.prefix`) === false) return message.send(new Discord.RichEmbed()
            .setColor("#FF0000")
            .setDescription('Sunucunuzda prefix varsayılan olarak ayarlı. Sıfırlayabileceğim bir şey yok.'));

        client.veritabanı.sil(`${message.guild.id}.prefix`)
        
        var embed = new Discord.RichEmbed()
        .setColor("#9b59b6")
        .setDescription(`Botun sunucudaki prefixi başarıyla sıfırlanarak tekrar \`${client.ayarlar.prefix}\` olarak ayarlandı!`)
        message.channel.send({embed:embed})
        return;
    }

    var embed = new Discord.RichEmbed()
    .setColor("#9b59b6")
    .setDescription(`Botun sunucudaki prefixi başarıyla \`${args.prefix}\` olarak ayarlandı!`)
    message.channel.send({embed:embed})
};
