module.exports = {
        komut: "reload",
        açıklama: "Belirtilen komutu yeniden başlatır.",
        kategori: "yapımcı",
        alternatifler: [],
        kullanım: "reload [komut adı]",
        yetki: 'BOT_OWNER',

        args: [
            {
                anahtar: 'komut',
                soru: 'Yeniden başlatılacak komutun adını yazınız.',
                tip: 'yazi'
            }
        ]
};


module.exports.baslat = async (client, message, args) => {
    var komut = args.komut;
    if (!client.kayıt.komutlar.has(komut) && !client.kayıt.alternatifler.has(komut)) return message.reply(`Botta \`${komut}\` adında bir komut bulunmuyor.`);
    var cmd = client.kayıt.komutlar.get(komut) || client.kayıt.komutlar.get(client.kayıt.alternatifler.get(komut));
    message.reply(`\`${cmd.komut}\` adlı komut yeniden başlatılıyor... \nKomut silinip, \`5 saniye\` sonra otomatik olarak tekrar yüklenecektir.`);
    client.kayıt.komutlar.delete(cmd.komut);
    setTimeout(() => {
        client.kayıt.komutlar.set(cmd.komut, cmd);
        message.reply(`\`${cmd.komut}\` adlı komut başarıyla yeniden başlatıldı!`)
    }, 5000);
};
