const path = require('path');
const fs = require('fs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

class TheFuntVeritabanı {
    constructor(verii) {
        this.veriDosya = verii;
        if (this.veriDosya.split(".").pop() !== 'json') throw new Error('Veritabanı dosyası "json" uzantılı olmalı. \nÖrneğin, "veritabanı.json" yapabilirsiniz.');

        if (this.veriDosya) { 
        this.db = low(new FileSync(this.veriDosya));
        };

        this.ayarla = this.constructor.ayarla;
        this.sil = this.constructor.sil;
        this.veri = this.constructor.veri;
        this.varMı = this.constructor.varMı;
        this.ekle = this.constructor.ekle;
        this.çıkar = this.constructor.çıkar;
        this.arttır = this.constructor.arttır;
        this.azalt = this.constructor.azalt;

        this.tümVeriler = this.constructor.tümVeriler;
        this.tümVerilerSil = this.constructor.tümVerilerSil;
    };
    

    static ayarla(anahtar, değer) {
        if (!this.veriDosya) throw new Error("Veri dosyası belirtilmemiş!");
        if (!anahtar) throw new TypeError('Lütfen üstüne veri ayarlayacağınız anahtar kelimeyi yazınız. \nÖrneğin; "client.veritabanı.ayarla(\'test\', \'buraya veri gelecek\')"');
        if (!değer) throw new TypeError('Lütfen ayarlayacağınız veriyi/değeri yazınız. \nÖrneğin; "client.veritabanı.ayarla(\'buraya anahtar kelime gelecek\', \'test verisi\')"');
        this.db.set(anahtar, değer).write()
        return this.db.get(anahtar, değer).value()
    };

    static sil(anahtar) {
        if (!this.veriDosya) throw new Error("Veri dosyası belirtilmemiş!");
        if (!anahtar) throw new TypeError('Lütfen verileri silinecek anahtar kelimeyi yazınız. \nÖrneğin; "client.veritabanı.sil(\'test\')"');
        if (this.db.has(anahtar).value() === false) return false
        this.db.unset(anahtar).write()
        return true
    };

    static veri(anahtar) {
        if (!this.veriDosya) throw new Error("Veri dosyası belirtilmemiş!");
        if (!anahtar) throw new TypeError('Lütfen verileri gösterilecek anahtar kelimeyi yazınız. \nÖrneğin; "client.veritabanı.veri(\'test\')"');
        if (this.db.has(anahtar).value() === false) return null
        return this.db.get(anahtar).value()
    };

    static varMı(anahtar) {
        if (!this.veriDosya) throw new Error("Veri dosyası belirtilmemiş!");       
        if (!anahtar) throw new TypeError('Lütfen içinde veri var mı, yok mu gösterilecek anahtar kelimeyi yazınız. \nÖrneğin; "client.veritabanı.varMı(\'test\')"');
        return this.db.has(anahtar).value()
    };

    static ekle(anahtar, değer) {
        if (!this.veriDosya) throw new Error("Veri dosyası belirtilmemiş!");
        if (!anahtar) throw new TypeError('Lütfen veri eklenecek anahtar kelimeyi yazınız.');
        if (!değer) throw new TypeError('Lütfen eklenecek veriyi yazınız.');
        if (this.db.has(anahtar).value() === false) return null
        if (Array.isArray(this.db.get(anahtar).value()) === false) throw new TypeError(`\`${anahtar}\` anahtar kelimesindeki veri bir "Array" olmadığı için üstüne veri ekleyemiyorum!`);
        this.db.get(anahtar).push(değer).write()
        return this.db.get(anahtar).value()
    };

    static çıkar(anahtar, değer) {
        if (!this.veriDosya) throw new Error("Veri dosyası belirtilmemiş!");
        if (!anahtar) throw new TypeError('Lütfen veri çıkarılacak anahtar kelimeyi yazınız.');
        if (!değer) throw new TypeError('Lütfen çıkarılacak veriyi yazınız.');
        if (this.db.has(anahtar).value() === false) return null
        if (Array.isArray(this.db.get(anahtar).value()) === false) throw new TypeError(`\`${anahtar}\` anahtar kelimesindeki veri bir "Array" olmadığı için üstünden veri çıkaramıyorum!`);
        this.db.get(anahtar).remove(değer).write()
        return this.db.get(anahtar).value()
    };

    static arttır(anahtar, değer) {
        if (!this.veriDosya) throw new Error("Veri dosyası belirtilmemiş!");
        if (!anahtar) throw new TypeError('Lütfen veri arttırılacak anahtar kelimeyi yazınız.');
        if (!değer) throw new TypeError('Lütfen arttırılacak sayıyı yazınız.');
        if (this.db.has(anahtar).value() === false) return null
        if (typeof this.db.get(anahtar).value() !== 'number') throw new TypeError(`\`${anahtar}\` anahtar kelimesindeki veri bir "Sayı" olmadığı için bulunan veri ile yazılan veriyi toplayamıyorum!`);
        this.db.set(anahtar, Math.floor(this.db.get(anahtar).value()+değer)).write()
        return this.db.get(anahtar).value()
    };

    static azalt(anahtar, değer) {
        if (!this.veriDosya) throw new Error("Veri dosyası belirtilmemiş!");
        if (!anahtar) throw new TypeError('Lütfen veri azaltılacak anahtar kelimeyi yazınız.');
        if (!değer) throw new TypeError('Lütfen azalttırılacak sayıyı yazınız.');
        if (this.db.has(anahtar).value() === false) return null
        if (typeof this.db.get(anahtar).value() !== 'number') throw new TypeError(`\`${anahtar}\` anahtar kelimesindeki veri bir "Sayı" olmadığı için bulunan veriden yazılan veriyi çıkaramıyorum!`);
        this.db.set(anahtar, Math.floor(this.db.get(anahtar).value()-değer)).write()
        return this.db.get(anahtar).value()
    };

    static tümVeriler() {
        return JSON.parse(fs.readFileSync(this.veriDosya, 'utf8'))
    };

    static tümVerilerSil() {
        var file = JSON.parse(fs.readFileSync(this.veriDosya, 'utf8'))
        file = {};
        fs.writeFile(this.veriDosya, JSON.stringify(file));
        return true
    };

};

module.exports = TheFuntVeritabanı;
