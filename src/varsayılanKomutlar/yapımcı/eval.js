const Advanced = require("../../../index.js");
const Discord = require("discord.js");

module.exports = {
        komut: "eval",
        açıklama: "Kod denemeyi sağlar.",
        kategori: "yapımcı",
        alternatifler: ["kod", "kod-dene", "koddene"],
        kullanım: "eval [kod]",
        yetki: "BOT_OWNER",

        args: [
            {
                anahtar: 'kod',
                soru: 'Denenecek kodu yazınız.',
                tip: 'yazi'
            }
        ]
};


module.exports.baslat = async (client, message, args) => {
  const db = client.veritabanı;
  const msg = message;
  const mesaj = message;
  
    try {
    function clean(yazik) {
        if (typeof yazik !== 'string')
            yazik = require('util').inspect(yazik, { depth: 0 })
            yazik = yazik
            .replace(/`/g, '`' + String.fromCharCode(8203))
            .replace(/@/g, '@' + String.fromCharCode(8203))
        return yazik;
    }
    var y = clean(await eval(args.kod))
        message.channel.send(y, {code:"js", split:true})
    } catch(err) {
        message.channel.send("**Hata;**")
        message.channel.send("```js\n"+err+"```")
    }
};
