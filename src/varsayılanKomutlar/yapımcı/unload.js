module.exports = {
    komut: "unload",
    açıklama: "Belirtilen komutu devre dışı bırakır.",
    kategori: "yapımcı",
    alternatifler: [],
    kullanım: "unload [komut adı]",
    yetki: 'BOT_OWNER',

    args: [
        {
            anahtar: 'komut',
            soru: 'Devre dışı bırakılacak komutun adını yazınız.',
            tip: 'komut'
        }
    ]
};


module.exports.baslat = async (client, message, args) => {
var komut = args.komut;
var k = client.kayıt.alternatifler.has(komut) ? client.kayıt.komutlar.get(client.kayıt.alternatifler.get(komut)) : client.kayıt.komutlar.get(komut)

client.kayıt.alternatifler.has(komut) ? client.kayıt.komutlar.delete(client.kayıt.alternatifler.get(komut)) : client.kayıt.komutlar.delete(komut)
client.veritabanı.ayarla("kapatılmışKomutlar."+k.komut, true);

message.reply(`\`${k.komut}\` adlı komut başarıyla devre dışı bırakıldı!`)
};
