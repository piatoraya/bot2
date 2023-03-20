const fs = require("fs");

exports.Config = {
	botName: "NearBot",
	ownerName: "Near.Id",
	ampangPedia: {
		userid: "KZ2ttFZ7",
		apikey: "jUzlJJR788aLnldHvF16It5lYgmz4GGBrQ0C5SQhT9zvlbc3oGs6pnUDLEioqfiN",
	},
	APIs: {
		rose: "https://api.itsrose.site",
		apikey: "", // cek website to get apikey
	},

	// ubah se
	groupLink: "https://chat.whatsapp.com/FXjFa4zhzCO4nmWw9bDfsc",
	footer: "*ampangpedia.com*",
	sticker: {
		packname: "Near",
		author: "www.ampangpedia.com"
	},
	// cek folder image, timpa file
	pp_bot: fs.readFileSync("./image/foto.jpg"),
	qris: fs.readFileSync("./image/photo.jpg"),

	owner: ["6285242283425"],
	prefa: ["1", "2"],

	caption_pay: `Berikut List Payment Kami

Ovo ➪   085242283425
Dana ➪  085242283425
Gopay ➪ 085242283425

`,
	helpMenu: (name) => {
		return `Halo ${name}. Berikut List Menu

「 PUBLIC - MENU 」
• !owner
• !pay (bayar)
• !list (list)
• !sticker (buat sticker)

「 DOWNLOADERS - MENU 」
• !instagram
• !tiktok

「 ADMIN - MENU 」
• !addlist (add produk)
• !updatelist (edit produk)
• !dellist (delete produk)
• !jeda
• !tambah (+)
• !kurang (-)
• !kali (×)
• !bagi (:)
• !setproses (edit proses)
• !changeproses (ubah proses)
• !delsetproses (hapus proses)
• !setdone (edit selesai)
• !changedone (ubah selesai)
• !delsetdone (hapus selesai)
• !proses (loading)
• !done (selesai)
• !welcome (on/off)
• !goodbye (on/off)
• !setwelcome (edit welcome)
• !changewelcome (ubah welcome)
• !delsetwelcome (hapus welcome)
• !setleft (edit keluar)
• !changeleft (ubah keluar)
• !delsetleft (hapus keluar)
• !antiwame (on/off)
• !antilink (on/off)
• !open (buka group)
• !close (tutup group)
• !hidetag (pengumuman)


「 OWNER - MENU 」
• !addsewa (add sewa group)
• !bcgc (broadcast groups)
• !dellsewa (hapus sewa group)
• !join (join group)
• !leave (leave group)
• !listproduk (Listing Produk)
• !trx (transaksi)
`;
	},
};
exports.mess = {
	rowAdmin: "Fitur Khusus admin & owner!",
	admin: "Fitur Khusus admin!",
	group: "Fitur Khusus Group!",
	owner: "Fitur kuhusu owner!",
	botAdmin: "Jadikan bot sebagai admin terlebih dahulu",
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
	fs.unwatchFile(file);
	console.log(`Update ${__filename}`);
	delete require.cache[file];
	require(file);
});
