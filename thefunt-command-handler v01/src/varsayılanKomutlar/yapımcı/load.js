module.exports = {
    komut: "load",
    açıklama: "Belirtilen komutu bota yükler. (Yeni bir komut eklediyseniz ve botu kapatmak istemiyorsanız \"load\" komutu ile eklediğiniz yeni komutu rahatça yükleyebilirsiniz.)",
    kategori: "yapımcı",
    alternatifler: [],
    kullanım: "load [komut adı]",
    yetki: 'BOT_OWNER',

    args: [
        {
            anahtar: 'komutt',
            soru: 'Yüklenecek komutun adını yazınız.',
            tip: 'yazi'
        },
        {
            anahtar: 'kategorii',
            soru: 'Yüklenecek komutun bulunduğu kategoriyi yazınız.',
            tip: 'kategori'
        }
    ]
};


module.exports.baslat = async (client, message, args) => {
var komut = args.komutt;
var kategori = args.kategorii;

try {
var cmd = require(`${process.cwd()}/${client.ayarlar.komutDosya}/${kategori}/${komut}.js`)
client.kayıt.komutlar.set(cmd.komut, cmd)
cmd.alternatifler.forEach(a => {
    client.kayıt.alternatifler.set(a, cmd.komut)
  })
} catch(err) {
console.log(err)
return message.reply(`\`${client.ayarlar.komutDosya}\` klasöründe herhangi bir kategoride \`${komut}.js\` adında bir dosya bulunamadı!`)
}
if (client.veritabanı.varMı("kapatılmışKomutlar."+komut) === true) {
  client.veritabanı.sil("kapatılmışKomutlar."+komut)
}
message.reply(`\`${komut}\` adlı komut başarıyla yüklendi!`)
};
