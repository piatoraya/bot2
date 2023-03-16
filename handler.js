const numeral = require("numeral");
const { Config, mess } = require("./config.js");

const _Am_Pang = require("./lib/merchant.js");

// Set up ampangPedia Function
const ampangPedia = new _Am_Pang(Config.ampangPedia.userid, Config.ampangPedia.apikey);
ampangPedia.init();

const {
	BufferJSON,
	WA_DEFAULT_EPHEMERAL,
	generateWAMessageFromContent,
	proto,
	generateWAMessageContent,
	generateWAMessage,
	prepareWAMessageMedia,
	areJidsSameUser,
	getContentType,
	downloadMediaMessage
} = require("@adiwajshing/baileys");
const fs = require("fs");
const util = require("util");
const chalk = require("chalk");
const axios = require("axios");
const moment = require("moment-timezone");
const toMs = require("ms");
const FormData = require("form-data");

const { smsg, fetchJson, getBuffer } = require("./lib/simple");
const {
	writeExifImg,
	writeExifVid
} = require("./lib/exif.js");

const {
	updateResponList,
	delResponList,
	isAlreadyResponListGroup,
	sendResponList,
	isAlreadyResponList,
	getDataResponList,
	addResponList,
	isSetClose,
	addSetClose,
	removeSetClose,
	changeSetClose,
	getTextSetClose,
	isSetDone,
	addSetDone,
	removeSetDone,
	changeSetDone,
	getTextSetDone,
	isSetLeft,
	addSetLeft,
	removeSetLeft,
	changeSetLeft,
	getTextSetLeft,
	isSetOpen,
	addSetOpen,
	removeSetOpen,
	changeSetOpen,
	getTextSetOpen,
	isSetProses,
	addSetProses,
	removeSetProses,
	changeSetProses,
	getTextSetProses,
	isSetWelcome,
	addSetWelcome,
	removeSetWelcome,
	changeSetWelcome,
	getTextSetWelcome,
	addSewaGroup,
	getSewaExpired,
	getSewaPosition,
	expiredCheck,
	checkSewaGroup,
} = require("./lib/store");
async function getGroupAdmins(participants) {
	let users = [];
	for (let user of participants) {
		user.admin === "superadmin"
			? users.push(user.id)
			: user.admin === "admin"
			? users.push(user.id)
			: "";
	}
	return users || [];
}
function TelegraPh(Path) {
	return new Promise(async (resolve, reject) => {
		if (!fs.existsSync(Path)) {
			return reject(new Error("File not Found"));
		}
		try {
			const form = new FormData();
			form.append("file", fs.createReadStream(Path));
			const { data } = await axios({
				url: "https://telegra.ph/upload",
				method: "POST",
				headers: { ...form.getHeaders() },
				data: form,
			});
			return resolve("https://telegra.ph" + data[0].src);
		} catch (e) {
			return reject(new Error(String(e)));
		}
	});
}
const tanggal = (_date) => {
	myMonths = [
		"Januari",
		"Februari",
		"Maret",
		"April",
		"Mei",
		"Juni",
		"Juli",
		"Agustus",
		"September",
		"Oktober",
		"November",
		"Desember",
	];
	myDays = [
		"Minggu",
		"Senin",
		"Selasa",
		"Rabu",
		"Kamis",
		"Jum\u2019at",
		"Sabtu",
	];
	var _a = new Date(_date),
		_b = _a.getDate();
	bulan = _a.getMonth();
	var _c = _a.getDay(),
		_c = myDays[_c];
	var _d = _a.getYear(),
		_e = _d < 1000 ? _d + 1900 : _d;
	const _f = moment.tz("Asia/Jakarta").format("DD/MM HH:mm:ss");
	let _g = new Date();
	let _h = new Date(0).getTime() - new Date("1 January 1970").getTime(),
		_i = ["Pahing", "Pon", "Wage", "Kliwon", "Legi"][
			Math.floor((_g * 1 + _h) / 84600000) % 5
		];
	return _c + ", " + _b + " - " + myMonths[bulan] + " - " + _e;
};
const API = (name, path = "/", query = {}, apikeyqueryname) =>
	(name in Config.APIs ? Config.APIs[name] : name) +
	path +
	(query || apikeyqueryname
		? "?" +
		  new URLSearchParams(
				Object.entries({
					...query,
					...(apikeyqueryname ? { [apikeyqueryname]: Config.APIs.apikey } : {}),
				})
		  )
		: "");
module.exports = Meki = async (
	sock,
	m,
	msg,
	store,
	opengc,
	antilink,
	antiwame,
	set_welcome_db,
	set_left_db,
	set_proses,
	set_done,
	set_open,
	set_close,
	sewa,
	_welcome,
	_lelf,
	db_respon_list
) => {
	try {
		var _text =
				m.mtype === "conversation"
					? m.message.conversation
					: m.mtype == "imageMessage"
					? m.message.imageMessage.caption
					: m.mtype == "videoMessage"
					? m.message.videoMessage.caption
					: m.mtype == "extendedTextMessage"
					? m.message.extendedTextMessage.text
					: m.mtype == "buttonsResponseMessage"
					? m.message.buttonsResponseMessage.selectedButtonId
					: m.mtype == "listResponseMessage"
					? m.message.listResponseMessage.singleSelectReply.selectedRowId
					: m.mtype == "templateButtonReplyMessage"
					? m.message.templateButtonReplyMessage.selectedId
					: m.mtype === "messageContextInfo"
					? m.message.buttonsResponseMessage?.selectedButtonId ||
					  m.message.listResponseMessage?.singleSelectReply.selectedRowId ||
					  m.text
					: "",
			mText = typeof m.text == "string" ? m.text : "",
			prefix = Config.prefa
				? /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(_text)
					? _text.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0]
					: ""
				: Config.prefa ?? Config.prefix;
			command = _text
				.replace(prefix, "")
				.trim()
				.split(/ +/)
				.shift()
				.toLowerCase(),
			args = _text.trim().split(/ +/).slice(1),
			name = m.pushName || "No Name",
			botNumber = await sock.decodeJid(sock.user.id),
			isOwner = [botNumber, ...Config.owner]
				.map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
				.includes(m.sender),
			text = (q = args.join(" ")),
			quoted = m.quoted ? m.quoted : m,
			mime = (quoted.msg || quoted).mimetype || "",
			type = /image|video|sticker|audio/.test(mime),
			metadata = m.isGroup
				? await sock.groupMetadata(m.chat).catch(() => {})
				: "",
			gcName = m.isGroup ? metadata.subject : "",
			gcAdmins = m.isGroup ? await metadata.participants : "",
			allAdmins = m.isGroup ? await getGroupAdmins(gcAdmins) : "",
			botAdmin = m.isGroup ? allAdmins.includes(botNumber) : false,
			isAdmin = m.isGroup ? allAdmins.includes(m.sender) : false,
			isSewa = checkSewaGroup(m.chat, sewa),
			isAntiLink = antilink.includes(m.chat) ? true : false,
			isWelcome = _welcome.includes(m.chat),
			isLeft = _lelf.includes(m.chat),
			isAntiWaMe = antiwame.includes(m.chat) ? true : false,
			__tanggal = moment(Date.now())
				.tz("Asia/Jakarta")
				.locale("id")
				.format("HH:mm:ss z"),
			reply = (_msg) => {
				m.reply(_msg);
			};
		m.message &&
			(sock.readMessages([m.key]),
			console.log(
				chalk.black(chalk.bgWhite("[ CMD ]")),
				chalk.black(chalk.bgGreen(new Date())),
				chalk.black(chalk.bgBlue(mText || m.mtype)) +
					"\n" +
					chalk.magenta("=> From"),
				chalk.green(name),
				chalk.yellow(m.sender) + "\n" + chalk.blueBright("=> In"),
				chalk.green(m.isGroup ? name : "Chat Pribadi", m.chat)
			));
		//
		expiredCheck(sock, sewa);

		if (isAntiLink) {
			if (mText.match("chat.whatsapp.com")) {
				m.reply(
					"*\u300C ANTI LINK \u300D*\n\nLink grup detected, maaf kamu akan di kick !"
				);
				if (!botAdmin) {
					return
				}
				let linkGroup =
						"https://chat.whatsapp.com/" + (await sock.groupInviteCode(m.chat)),
					linkRegexp = new RegExp(linkGroup, "i"),
					isLinkGroup = linkRegexp.test(m.text);
				if (isLinkGroup || isAdmin || isOwner || isOwner || m.key.fromMe) {
					return;
				}
				sock.groupParticipantsUpdate(m.chat, [m.sender], "remove");
			}
		}
		if (isAntiWaMe) {
			if (mText.includes("Wa.me/" || "Wa.me/")) {
				m.reply(
					"*_ANTI WA ME_*\n\nWa Me detected, maaf kamu akan di kick !"
				);
				if (!botAdmin) {
					return
				}
				if (isLinkGroup || isAdmin || isOwner || isOwner || m.key.fromMe) {
					return;
				}
				sock.groupParticipantsUpdate(m.chat, [m.sender], "remove");
			}
		}
		if (
			isAlreadyResponList(m.isGroup ? m.chat : botNumber, _text, db_respon_list)
		) {
			var resType = getDataResponList(
				m.isGroup ? m.chat : botNumber,
				_text,
				db_respon_list
			);
			if (resType.isImage === false) {
				sock.sendMessage(
					m.chat,
					{
						text: sendResponList(
							m.isGroup ? m.chat : botNumber,
							_text,
							db_respon_list
						),
					},
					{ quoted: m }
				);
			} else {
				sock.sendMessage(
					m.chat,
					{
						image: await getBuffer(resType.image_url),
						caption: resType.response,
					},
					{ quoted: m }
				);
			}
		}
		switch (command) {
			case "owner":
			case "creator":
				{
					sock.sendContact(m.chat, Config.owner, m);
				}
				break;
			case "menu":
			case "help":
				{
					await sock.sendMessage(m.chat, {
						image: Config.pp_bot,
						caption: Config.helpMenu(name),
						footer: Config.footer,
						templateButtons: [
						{
							index: 1,
							urlButton: {
								displayText: "Group link",
								url: Config.groupLink || "https://itsrose.my.id",
							}
						},
						]
					})
				}
				break;
			case "payment":
			case "qris":
			case "pay":
				{
					sock.sendMessage(
						m.chat,
						{
							image: Config.qris,
							caption: Config.caption_pay,
						},
						{
							quoted: m,
						}
					);
				}
				break;
			case "list":
			case "store":
				{
					if (db_respon_list.length === 0) {
						return m.reply("Belum ada list message di database");
					}
					if (
						!isAlreadyResponListGroup(
							m.isGroup ? m.chat : botNumber,
							db_respon_list
						)
					) {
						return m.reply(
							"Belum ada list message yang terdaftar di group/chat ini"
						);
					}
					var listResponse = [];
					for (let i of db_respon_list) {
						if (i.id === (m.isGroup ? m.chat : botNumber)) {
							listResponse.push({
								title: i.key,
								rowId: i.key,
							});
						}
					}
					sock.sendMessage(m.chat, {
						text:
							"Halo @" +
							m.sender.split("@")[0] +
							", silahkan pilih item yang kamu butuhkan",
						buttonText: "Klik Disini",
						footer: "" + Config.footer,
						mentions: [m.sender],
						sections: [
							{
								title: m.isGroup ? gcName : Config.botName,
								rows: listResponse,
							},
						],
					});
				}
				break;
			case "dellist":
				{
					if (!(m.isGroup ? isAdmin : isOwner)) {
						return m.reply("Fitur Khusus admin & owner!");
					}
					if (db_respon_list.length === 0) {
						return m.reply("Belum ada list message di database");
					}
					if (!text) {
						return m.reply(
							"Gunakan dengan cara " +
								(prefix + command) +
								" *key*\n\n_Contoh_\n\n" +
								(prefix + command) +
								" hello"
						);
					}
					if (
						!isAlreadyResponList(
							m.isGroup ? m.chat : botNumber,
							q,
							db_respon_list
						)
					) {
						return m.reply(
							"List respon dengan key *" + q + "* tidak ada di database!"
						);
					}
					delResponList(m.isGroup ? m.chat : botNumber, q, db_respon_list);
					reply("Sukses delete list message dengan key *" + q + "*");
				}
				break;
			case "addlist":
				{
					if (!(m.isGroup ? isAdmin : isOwner)) {
						return m.reply("Fitur Khusus admin & owner!");
					}
					var teks1 = q.split("|")[0],
						teks2 = q.split("|")[1];
					if (!q.includes("|")) {
						return m.reply(
							"Gunakan dengan cara " +
								command +
								" *key|response*\n\n_Contoh_\n\n" +
								command +
								" tes|apa"
						);
					}
					if (
						isAlreadyResponList(
							m.isGroup ? m.chat : botNumber,
							teks1,
							db_respon_list
						)
					) {
						return m.reply(
							"List respon dengan key : *" + teks1 + "* sudah ada di chat ini."
						);
					}
					if (m.isGroup) {
						if (/image/.test(mime)) {
							let _media = await sock.downloadAndSaveMediaMessage(quoted),
								imgUrl = await TelegraPh(_media);
							addResponList(m.chat, teks1, teks2, true, imgUrl, db_respon_list);
							reply("Sukses set list message dengan key : *" + teks1 + "*");
							if (fs.existsSync(_media)) {
								fs.unlinkSync(_media);
							}
						} else {
							addResponList(m.chat, teks1, teks2, false, "-", db_respon_list),
								reply("Sukses set list message dengan key : *" + teks1 + "*");
						}
					} else {
						if (/image/.test(mime)) {
							let _media = await sock.downloadAndSaveMediaMessage(quoted),
								imgUrl = await TelegraPh(_media);
							addResponList(
								botNumber,
								teks1,
								teks2,
								true,
								imgUrl,
								db_respon_list
							);
							reply("Sukses set list message dengan key : *" + teks1 + "*");
							if (fs.existsSync(_media)) {
								fs.unlinkSync(_media);
							}
						} else {
							addResponList(
								botNumber,
								teks1,
								teks2,
								false,
								"-",
								db_respon_list
							);
							reply("Sukses set list message dengan key : *" + teks1 + "*");
						}
					}
				}
				break;
			case "updatelist":
			case "update":
				{
					if (!(m.isGroup ? isAdmin : isOwner)) {
						return m.reply(mees.rowAdmin);
					}
					var teks1 = q.split("|")[0],
						teks2 = q.split("|")[1];
					if (!q.includes("|")) {
						return m.reply(
							"Gunakan dengan cara " +
								command +
								" *key|response*\n\n_Contoh_\n\n" +
								command +
								" tes|apa"
						);
					}
					if (
						!isAlreadyResponListGroup(
							m.isGroup ? m.chat : botNumber,
							db_respon_list
						)
					) {
						return m.reply(
							"Maaf, untuk key *" + teks1 + "* belum terdaftar di chat ini"
						);
					}
					if (/image/.test(mime)) {
						let _media = await sock.downloadAndSaveMediaMessage(quoted),
							imgUrl = await TelegraPh(_media);
						updateResponList(
							m.isGroup ? m.chat : botNumber,
							teks1,
							teks2,
							true,
							imgUrl,
							db_respon_list
						);
						reply("Sukses update respon list dengan key *" + teks1 + "*");
						if (fs.existsSync(_media)) {
							fs.unlinkSync(_media);
						}
					} else {
						updateResponList(
							m.isGroup ? m.chat : botNumber,
							teks1,
							teks2,
							false,
							"-",
							db_respon_list
						);
						reply("Sukses update respon list dengan key *" + teks1 + "*");
					}
				}
				break;
			case "jeda":
				{
					if (!m.isGroup) {
						return m.reply(mess.group);
					}
					if (!isAdmin) {
						return m.reply(mess.admin);
					}
					if (!botAdmin) {
						return m.reply(mess.botAdmin);
					}
					if (!text) {
						return m.reply(
							"kirim " +
								command +
								" waktu\nContoh: " +
								command +
								" 30m\n\nlist waktu:\ns = detik\nm = menit\nh = jam\nd = hari"
						);
					}
					opengc[m.chat] = {
						id: m.chat,
						time: Date.now() + toMS(text),
					};
					fs.writeFileSync("./database/opengc.json", JSON.stringify(opengc));
					sock
						.groupSettingUpdate(m.chat, "announcement")
						.then(() => reply("Sukses, group akan dibuka " + text + " lagi"))
						.catch(() => reply("Error"));
				}
				break;
			case "tambah":
				{
					if (!text.includes("+")) {
						return m.reply(
							"Gunakan dengan cara " +
								command +
								" *angka* + *angka*\n\n_Contoh_\n\n" +
								command +
								" 1+2"
						);
					}
					arg = args.join(" ");
					atas = arg.split("+")[0];
					bawah = arg.split("+")[1];
					reply("" + (Number(atas) + Number(bawah)));
				}
				break;
			case "kurang":
				{
					if (!text.includes("-")) {
						return m.reply(
							"Gunakan dengan cara " +
								command +
								" *angka* - *angka*\n\n_Contoh_\n\n" +
								command +
								" 1-2"
						);
					}
					arg = args.join(" ");
					atas = arg.split("-")[0];
					bawah = arg.split("-")[1];
					reply("" + (Number(atas) - Number(bawah)));
				}
				break;
			case "kali":
				{
					if (!text.includes("*")) {
						return m.reply(
							"Gunakan dengan cara " +
								command +
								" *angka* * *angka*\n\n_Contoh_\n\n" +
								command +
								" 1*2"
						);
					}
					arg = args.join(" ");
					atas = arg.split("*")[0];
					bawah = arg.split("*")[1];
					reply("" + Number(atas) * Number(bawah));
				}
				break;
			case "bagi":
				{
					if (!text.includes("/")) {
						return m.reply(
							"Gunakan dengan cara " +
								command +
								" *angka* / *angka*\n\n_Contoh_\n\n" +
								command +
								" 1/2"
						);
					}
					arg = args.join(" ");
					atas = arg.split("/")[0];
					bawah = arg.split("/")[1];
					reply("" + Number(atas) / Number(bawah));
				}
				break;
			case "setproses":
			case "setp":
				{
					if (!(m.isGroup ? isAdmin : isOwner)) {
						return m.reply(mess.admin);
					}
					if (!text) {
						return m.reply(
							"Gunakan dengan cara " +
								(prefix + command) +
								" *teks*\n\n_Contoh_\n\n" +
								(prefix + command) +
								" Pesanan sedang di proses ya @user\n\n- @user (tag org yg pesan)\n- @pesanan (pesanan)\n- @jam (waktu pemesanan)\n- @tanggal (tanggal pemesanan) "
						);
					}
					if (isSetProses(m.isGroup ? m.chat : botNumber, set_proses)) {
						return m.reply("Set proses already active");
					}
					addSetProses(text, m.isGroup ? m.chat : botNumber, set_proses);
					reply("\u2705 Done set proses!");
				}
				break;
			case "changeproses":
			case "changep":
				{
					if (!(m.isGroup ? isAdmin : isOwner)) {
						return m.reply(mess.admin);
					}
					if (!text) {
						return m.reply(
							"Gunakan dengan cara " +
								(prefix + command) +
								" *teks*\n\n_Contoh_\n\n" +
								(prefix + command) +
								" Pesanan sedang di proses ya @user\n\n- @user (tag org yg pesan)\n- @pesanan (pesanan)\n- @jam (waktu pemesanan)\n- @tanggal (tanggal pemesanan) "
						);
					}
					if (isSetProses(m.isGroup ? m.chat : botNumber, set_proses)) {
						changeSetProses(text, m.isGroup ? m.chat : botNumber, set_proses);
						m.reply("Sukses ubah set proses!");
					} else {
						addSetProses(text, m.isGroup ? m.chat : botNumber, set_proses),
							m.reply("Sukses ubah set proses!");
					}
				}
				break;
			case "delsetproses":
			case "delsetp":
				{
					if (!(m.isGroup ? isAdmin : isOwner)) {
						return m.reply(mess.admin);
					}
					if (!isSetProses(m.isGroup ? m.chat : botNumber, set_proses)) {
						return m.reply("Belum ada set proses di gc ini");
					}
					removeSetProses(m.isGroup ? m.chat : botNumber, set_proses);
					reply("Sukses delete set proses");
				}
				break;
			case "setdone": {
				if (!(m.isGroup ? isAdmin : isOwner)) {
					return m.reply(mess.admin);
				}
				if (!text) {
					return m.reply(
						"Gunakan dengan cara " +
							(prefix + command) +
							" *teks*\n\n_Contoh_\n\n" +
							(prefix + command) +
							" Done @user\n\n- @user (tag org yg pesan)\n- @pesanan (pesanan)\n- @jam (waktu pemesanan)\n- @tanggal (tanggal pemesanan) "
					);
				}
				if (isSetDone(m.isGroup ? m.chat : botNumber, set_done)) {
					return m.reply("Udh set done sebelumnya");
				}
				addSetDone(text, m.isGroup ? m.chat : botNumber, set_done);
				reply("Sukses set done!");
				break;
			}
			case "changedone":
			case "changed":
				{
					if (!(m.isGroup ? isAdmin : isOwner)) {
						return m.reply(mess.admin);
					}
					if (!text) {
						return m.reply(
							"Gunakan dengan cara " +
								(prefix + command) +
								" *teks*\n\n_Contoh_\n\n" +
								(prefix + command) +
								" Done @user\n\n- @user (tag org yg pesan)\n- @pesanan (pesanan)\n- @jam (waktu pemesanan)\n- @tanggal (tanggal pemesanan) "
						);
					}
					if (isSetDone(m.isGroup ? m.chat : botNumber, set_done)) {
						changeSetDone(text, m.isGroup ? m.chat : botNumber, set_done);
						m.reply("Sukses ubah set done!");
					} else {
						addSetDone(text, m.isGroup ? m.chat : botNumber, set_done);
						m.reply("Sukses ubah set done!");
					}
				}
				break;
			case "delsetdone":
			case "delsetd":
				{
					if (!(m.isGroup ? isAdmin : isOwner)) {
						return m.reply(mess.admin);
					}
					if (!isSetDone(m.isGroup ? m.chat : botNumber, set_done)) {
						return m.reply("Belum ada set done di gc ini");
					}
					removeSetDone(m.isGroup ? m.chat : botNumber, set_done);
					m.reply("Sukses delete set done");
				}
				break;
			case "p":
			case "proses":
				{
					if (!(m.isGroup ? isAdmin : isOwner)) {
						return m.reply(mess.admin);
					}
					if (!m.quoted) {
						return m.reply("Reply pesanan yang akan proses");
					}
					let _q = m.quoted ? quoted.text : quoted.text.split(args[0])[1],
						pesan =
							"\u300C *TRANSAKSI PENDING* \u300D\n\n```\uD83D\uDCC6 TANGGAL : @tanggal\n\u231A JAM     : @jam\n\u2728 STATUS  : Pending```\n\n\uD83D\uDCDD Catatan :\n@pesanan\n\nPesanan @user sedang di proses!";
					const textProses = getTextSetProses(
						m.isGroup ? m.chat : botNumber,
						set_proses
					);
					if (textProses !== undefined) {
						sock.sendTextWithMentions(
							m.chat,
							textProses
								.replace("@pesanan", _q ? _q : "-")
								.replace("@user", "@" + m.quoted.sender.split("@")[0])
								.replace("@jam", __tanggal)
								.replace("@tanggal", tanggal(new Date()))
								.replace("@user", "@" + m.quoted.sender.split("@")[0]),
							m
						);
					} else {
						sock.sendTextWithMentions(
							m.chat,
							pesan
								.replace("@pesanan", _q ? _q : "-")
								.replace("@user", "@" + m.quoted.sender.split("@")[0])
								.replace("@jam", __tanggal)
								.replace("@tanggal", tanggal(new Date()))
								.replace("@user", "@" + m.quoted.sender.split("@")[0]),
							m
						);
					}
				}
				break;
			case "d":
			case "done":
				{
					if (!(m.isGroup ? isAdmin : isOwner)) {
						return m.reply(mess.admin);
					}
					if (!m.quoted) {
						return m.reply("Reply pesanan yang telah di proses");
					}
					let _q = m.quoted ? quoted.text : quoted.text.split(args[0])[1],
						pesan =
							"\u300C *TRANSAKSI BERHASIL* \u300D\n\n```\uD83D\uDCC6 TANGGAL : @tanggal\n\u231A JAM     : @jam\n\u2728 STATUS  : Berhasil```\n\nTerimakasih @user Next Order ya\uD83D\uDE4F";
					const textDone = getTextSetDone(
						m.isGroup ? m.chat : botNumber,
						set_done
					);
					if (textDone !== undefined) {
						sock.sendTextWithMentions(
							m.chat,
							textDone
								.replace("@pesanan", _q ? _q : "-")
								.replace("@user", "@" + m.quoted.sender.split("@")[0])
								.replace("@jam", __tanggal)
								.replace("@tanggal", tanggal(new Date()))
								.replace("@user", "@" + m.quoted.sender.split("@")[0]),
							m
						);
					} else {
						sock.sendTextWithMentions(
							m.chat,
							pesan
								.replace("@pesanan", _q ? _q : "-")
								.replace("@user", "@" + m.quoted.sender.split("@")[0])
								.replace("@jam", __tanggal)
								.replace("@tanggal", tanggal(new Date()))
								.replace("@user", "@" + m.quoted.sender.split("@")[0]),
							m
						);
					}
				}
				break;
			case "welcome":
				{
					if (!m.isGroup) {
						return m.reply(mess.group);
					}
					if (!isAdmin) {
						return m.reply(mess.admin);
					}
					if (args[0] === "on") {
						if (isWelcome) {
							return m.reply("Udah on");
						}
						_welcome.push(m.chat);
						fs.writeFileSync(
							"./database/welcome.json",
							JSON.stringify(_welcome, null, 2)
						);
						reply("Sukses mengaktifkan welcome di grup ini");
					} else {
						if (args[0] === "off") {
							if (!isWelcome) {
								return m.reply("Udah off");
							}
							_welcome.splice(_welcome.indexOf(m.chat), 1);
							fs.writeFileSync(
								"./database/welcome.json",
								JSON.stringify(_welcome, null, 2)
							);
							reply("Sukses menonaktifkan welcome di grup ini");
						} else {
							reply(
								"Kirim perintah " +
									(prefix + command) +
									" on/off\n\nContoh: " +
									(prefix + command) +
									" on"
							);
						}
					}
				}
				break;
			case "left":
			case "goodbye":
				{
					if (!m.isGroup) {
						return m.reply(mess.group);
					}
					if (!isAdmin) {
						return m.reply(mess.admin);
					}
					if (args[0] === "on") {
						if (isLeft) {
							return m.reply("Udah on");
						}
						_lelf.push(m.chat);
						fs.writeFileSync(
							"./database/left.json",
							JSON.stringify(_lelf, null, 2)
						);
						reply("Sukses mengaktifkan goodbye di grup ini");
					} else {
						if (args[0] === "off") {
							if (!isLeft) {
								return m.reply("Udah off");
							}
							_lelf.splice(_lelf.indexOf(m.chat), 1);
							fs.writeFileSync(
								"./database/welcome.json",
								JSON.stringify(_lelf, null, 2)
							);
							reply("Sukses menonaktifkan goodbye di grup ini");
						} else {
							reply(
								"Kirim perintah " +
									(prefix + command) +
									" on/off\n\nContoh: " +
									(prefix + command) +
									" on"
							);
						}
					}
				}
				break;
			case "setwelcome":
				{
					if (!m.isGroup) {
						return m.reply(mess.group);
					}
					if (!isOwner && !isAdmin) {
						return m.reply(mess.rowAdmin);
					}
					if (!text) {
						return m.reply(
							"Gunakan dengan cara " +
								command +
								" *teks_welcome*\n\n_Contoh_\n\n" +
								command +
								" Halo @user, Selamat datang di @group"
						);
					}
					if (isSetWelcome(m.chat, set_welcome_db)) {
						return m.reply("Set welcome already active");
					}
					addSetWelcome(text, m.chat, set_welcome_db);
					reply("Successfully set welcome!");
				}
				break;
			case "changewelcome":
				{
					if (!m.isGroup) {
						return m.reply(mess.group);
					}
					if (!isOwner && !isAdmin) {
						return m.reply(mess.rowAdmin);
					}
					if (!text) {
						return m.reply(
							"Gunakan dengan cara " +
								command +
								" *teks_welcome*\n\n_Contoh_\n\n" +
								command +
								" Halo @user, Selamat datang di @group"
						);
					}
					if (isSetWelcome(m.chat, set_welcome_db)) {
						changeSetWelcome(q, m.chat, set_welcome_db);
						reply("Sukses change set welcome teks!");
					} else {
						addSetWelcome(q, m.chat, set_welcome_db);
						reply("Sukses change set welcome teks!");
					}
				}
				break;
			case "delsetwelcome":
				{
					if (!m.isGroup) {
						return m.reply(mess.group);
					}
					if (!isOwner && !isAdmin) {
						return m.reply(mess.rowAdmin);
					}
					if (!isSetWelcome(m.chat, set_welcome_db)) {
						return m.reply("Belum ada set welcome di sini..");
					}
					removeSetWelcome(m.chat, set_welcome_db);
					reply("Sukses delete set welcome");
				}
				break;
			case "setleft":
				{
					if (!m.isGroup) {
						return m.reply(mess.group);
					}
					if (!isOwner && !isAdmin) {
						return m.reply(mess.rowAdmin);
					}
					if (!text) {
						return m.reply(
							"Gunakan dengan cara " +
								(prefix + command) +
								" *teks_left*\n\n_Contoh_\n\n" +
								(prefix + command) +
								" Halo @user, Selamat tinggal dari @group"
						);
					}
					if (isSetLeft(m.chat, set_left_db)) {
						return m.reply("Set left already active");
					}
					addSetLeft(q, m.chat, set_left_db);
					reply("Successfully set left!");
				}
				break;
			case "changeleft":
				{
					if (!m.isGroup) {
						return m.reply(mess.group);
					}
					if (!isOwner && !isAdmin) {
						return m.reply(mess.rowAdmin);
					}
					if (!text) {
						return m.reply(
							"Gunakan dengan cara " +
								(prefix + command) +
								" *teks_left*\n\n_Contoh_\n\n" +
								(prefix + command) +
								" Halo @user, Selamat tinggal dari @group"
						);
					}
					if (isSetLeft(m.chat, set_left_db)) {
						changeSetLeft(q, m.chat, set_left_db);
						reply("Sukses change set left teks!");
					} else {
						addSetLeft(q, m.chat, set_left_db);
						reply("Sukses change set left teks!");
					}
				}
				break;
			case "delsetleft":
				{
					if (!m.isGroup) {
						return m.reply(mess.group);
					}
					if (!isOwner && !isAdmin) {
						return m.reply(mess.rowAdmin);
					}
					if (!isSetLeft(m.chat, set_left_db)) {
						return m.reply("Belum ada set left di sini..");
					}
					removeSetLeft(m.chat, set_left_db);
					reply("Sukses delete set left");
				}
				break;
			case "antiwame":
				{
					if (!m.isGroup) {
						return m.reply(mess.group);
					}
					if (!isAdmin) {
						return m.reply(mess.admin);
					}
					if (!botAdmin) {
						return m.reply("Jadikan bot sebagai admin terlebih dahulu");
					}
					if (args[0] === "on") {
						if (isAntiWaMe) {
							return m.reply("Udah aktif");
						}
						antiwame.push(m.chat);
						fs.writeFileSync(
							"./database/antiwame.json",
							JSON.stringify(antiwame, null, 2)
						);
						reply("Successfully Activate Antiwame In This Group");
					} else {
						if (args[0] === "off") {
							if (!isAntiWaMe) {
								return m.reply("Udah nonaktif");
							}
							antiwame.splice(antiwame.indexOf(m.chat), 1);
							fs.writeFileSync(
								"./database/antiwame.json",
								JSON.stringify(antiwame, null, 2)
							);
							reply("Successfully Disabling Antiwame In This Group");
						} else {
							reply(
								"Kirim perintah " +
									(prefix + command) +
									" on/off\n\nContoh: " +
									(prefix + command) +
									" on"
							);
						}
					}
				}
				break;
			case "open":
			case "buka":
				{
					if (!m.isGroup) {
						return m.reply(mess.group);
					}
					if (!isAdmin) {
						return m.reply(mess.admin);
					}
					if (!botAdmin) {
						return m.reply(mess.botAdmin);
					}
					sock.groupSettingUpdate(m.chat, "not_announcement");
					const textOpen = await getTextSetOpen(m.chat, set_open);
					reply(
						textOpen ||
							"Sukses mengizinkan semua peserta dapat mengirim pesan ke grup ini"
					);
				}
				break;
			case "antilink":
				{
					if (!m.isGroup) {
						return m.reply(mess.group);
					}
					if (!isAdmin) {
						return m.reply(mess.admin);
					}
					if (!botAdmin) {
						return m.reply("Bot harus menjadi admin");
					}
					if (args[0] === "on") {
						if (isAntiLink) {
							return m.reply("Udah aktif");
						}
						antilink.push(m.chat);
						fs.writeFileSync(
							"./database/antilink.json",
							JSON.stringify(antilink, null, 2)
						);
						reply("Successfully Activate Antilink In This Group");
					} else {
						if (args[0] === "off") {
							if (!isAntiLink) {
								return m.reply("Udah nonaktif");
							}
							antilink.splice(antilink.indexOf(m.chat), 1);
							fs.writeFileSync(
								"./database/antilink.json",
								JSON.stringify(antilink, null, 2)
							);
							reply("Successfully Disabling Antilink In This Group");
						} else {
							reply(
								"Kirim perintah " +
									(prefix + command) +
									" on/off\n\nContoh: " +
									(prefix + command) +
									" on"
							);
						}
					}
				}
				break;
			case "close":
			case "tutup":
				{
					if (!m.isGroup) {
						return m.reply(mess.group);
					}
					if (!isAdmin) {
						return m.reply(mess.admin);
					}
					if (!botAdmin) {
						return m.reply(mess.botAdmin);
					}
					sock.groupSettingUpdate(m.chat, "announcement");
					const textClose = await getTextSetClose(m.chat, set_close);
					reply(
						textClose ||
							"Sukses mengizinkan hanya admin yang dapat mengirim pesan ke grup ini"
					);
				}
				break;
			case "h":
			case "hidetag":
				{
					if (!m.isGroup) {
						return reply(mess.group);
					}
					if (!(isAdmin || isOwner)) {
						return reply(mess.rowAdmin);
					}
					let _q = m.quoted ? quoted.text : text ? text : "";
					sock.sendMessage(
						m.chat,
						{
							text: _q,
							mentions: gcAdmins.map((v) => v.id),
						},
						{}
					);
				}
				break;
				case "trx": {
					if (!isOwner) {
						return m.reply("ONLY OWNER");
					}
					if (!args[0] || !args[1]) {
						return m.reply(`.*${command}* PRODUCT NO_TUJUAN`);
					}
					const TRX = await ampangPedia.prepaid.order(args[0], args[1]);
					console.log(TRX);
					const { data } = TRX;
					if (TRX.result && data !== null) {
						let _text = `_Transaksi status *${data.status}*_

*TRXID* : ${data.trxid}
*Order Id* : ${data.data}
*Item Id* : ${data.service}
*Note*: ${data.note}

*_${TRX.message}_*`;
						m.reply(_text);
					} else {
						return m.reply(TRX.message);
					}
					const _status = await ampangPedia.watch(data.trxid);
					if (_status.result) {
						const { data } = _status;
						let _data = data[0];
						let _text = `_Transaksi status *${_data.status}*_

*TRXID* : ${_data.trxid}
*Order Id* : ${_data.data}
*Item Id* : ${_data.service}
*Note* : ${_data.note}`;
						m.reply(_text);
					}
					console.log(_status);
					break;
				}
				case "status": {
					if (!isOwner) {
						return m.reply("ONLY OWNER");
					}
					if (!args[0]) {
						return m.reply(`.*${command}* TRXID`);
					}
					const _status = await ampangPedia.watch(args[0]);
					if (_status.result) {
						const { data } = _status;
						// use let
						let _data = data[0];
						console.log(_data)
						let _text = `_Transaksi status *${_data.status}*_

TRXID: ${_data.trxid}
orderID: ${_data.data}
itemID: ${_data.service}`;
						m.reply(_text);
					}
					break;
				}

				case "listproduk": {
					if (!isOwner) {
						return m.reply(mess.owner)
					}
					// pass arguments here
					const [_arg1, _arg_2] = text.split("|");
					if (!_arg1 && !_arg_2) {
						const listP = {};
						const listSections = [];
						const _p = await ampangPedia.prepaid.services();
						// LOLL
						_p.data.forEach((v) => {
							Object.assign(listP, {
								[v.type]: v.type,
							});
						});
						Object.keys(listP).sort().forEach((key) => {
							listSections.push({
								title: listP[key],
								rowId: `!${command} ${listP[key]}`,
							});
						});
						const listMessage = {
							text: "Berikut daftar produk",
							footer: Config.name,
							title: "List Product",
							buttonText: "Choose",
							sections: [
								{
									title: "List",
									rows: listSections,
								},
							],
						};
						return await sock.sendMessage(m.chat, listMessage);
					}
					if (_arg1 && !_arg_2) {
						const listP = {};
						const listSections = [];
						let _p = await ampangPedia.prepaid.services(_arg1);
						if (_p.result) {
							_p = _p.data.filter((item) => item.type === _arg1);
							_p.forEach((v) => {
								Object.assign(listP, {
									[v.brand]: v.brand,
								});
							});
							Object.keys(listP).sort().forEach((key) => {
								listSections.push({
									title: listP[key],
									rowId: `!${command} ${_arg1}|${listP[key]}`,
								});
							});
							const listMessage = {
								text: "Berikut daftar produk " + _arg1,
								footer: Config.footer,
								title: "List Product",
								buttonText: "Choose",
								sections: [
									{
										title: "List",
										rows: listSections,
									},
								],
							};
							return await sock.sendMessage(m.chat, listMessage);
						}
					}
					if (_arg1 && _arg_2) {
						let _p = await ampangPedia.prepaid.services(_arg1, _arg_2);
						_p = _p.data.filter(
							(item) => item.type === _arg1 && item.brand === _arg_2
						);
						let _text = "Berikut daftar produk \n\n";
						for (const i of _p.sort((a, b) => a.price - b.price).filter((v) => v.status == "available")) {
							_text += `*Code* : ${i.code}
*Nama* : ${i.name}
*Harga* : Rp. ${Number(i.price * 1.03).toLocaleString("id")}
*Status* : ${i.status}
*Note* : Rp. ${i.note}\n\n`;
						}
						return m.reply(_text);
					}
					break;
				}
				case "leave": {
					if (!m.isGroup) {
						return m.reply(mess.group)
					}
					if (!isOwner) {
						return m.reply(mess.owner)
					}
					await sock.groupLeave(m.chat);
					break
				}
				case "join": {
					if (!isOwner) {
						return m.reply(mess.owner)
					}
					if (!args[0]) {
						return m.reply(`Example: *${prefix + command}* link_gc`)
					}
					const linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})( [0-9]{1,3})?/i;
					let [_, code] = args[0].match(linkRegex) || [];
					if (!code) {
						return m.reply("Link invalid")
					}
					const Jid = await sock.groupAcceptInvite(code);
					m.reply(`Berhasil join group\n\nJid: ${Jid}`)
					break
				}
				case "tiktok": {
					if (!args[0]) {
						return m.reply(`Example: ${command} link_tiktod`)
					}
					m.reply("Proses..")
					const json = await fetchJson(API("rose", "/downloader/tiktok", {
						url: args[0]
					}, "apikey" ));
					if (!json.status) {
						return m.reply(json.message || "Failed")
					}
					await sock.sendMessage(m.chat, {
						video: { url: json.download.nowm }
					}, { quoted: m });
					break
				}
				case "instagram": {
					if (!args[0]) {
						return m.reply(`Example: ${command} link_ig`)
					}
					const json = await fetchJson(API("rose", "/downloader/ig", {
						url: args[0]
					}, "apikey" ));
					if (!json.status) {
						return m.reply(json.message || "Failed")
					}
					for (const i of json.result) {
						const { headers } = await axios.head(i.url).catch((e) => e === null || e === void 0 ? void 0 : e.response);
						if (headers && headers["content-type"]) {
							if (headers["content-type"].includes("image") || headers["content-type"].includes("image")) {
								const __type = headers["content-type"].includes("image") ? "image" : headers["content-type"].includes("video") ? "video" : false
								if (__type) {
									await sock.sendMessage(m.chat, {
										[__type]: {
											url: i.url
										}
									}, { quoted: m })
								}
							}
						}
					}
					break;
				}
				case "addsewa": {
					if (!isOwner) {
						return m.reply(mess.owner)
					}
					if (!args[0] || !args[1]) {
						return m.reply(`Example: *${prefix + command}* link_c 1d`)
					}
					const linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})( [0-9]{1,3})?/i;
					let [_, code] = args[0].match(linkRegex) || [];
					if (!code) {
						return m.reply("Link invalid")
					}
					const jid = await sock.groupAcceptInvite(code);
					if (checkSewaGroup(jid, sewa)) {
						return m.reply(`Bot sudah disewa di group tersebut.`)
					}
					addSewaGroup(jid, args[1], sewa);
					m.reply("sukses add sewa")
					break
				}
				case "dellsewa": {
					if (!isOwner) {
						return replyDeface(mess.owner);
					}
					if (!m.isGroup) {
						return m.reply(
							`Perintah ini hanya bisa dilakukan di Grup yang menyewa bot`
						);
					}
					if (!isSewa) {
						return m.reply(`Bot tidak disewa di Grup ini`);
					}
					sewa.splice(getSewaPosition(m.chat, sewa), 1);
					fs.writeFileSync("./database/sewa.json", JSON.stringify(sewa));
					await sock.groupLeave(m.chat)
					break;
				}
				case "ceksewa": {
					if (!m.isGroup) {
						return m.reply(mess.group)
					}
					if (!isSewa) {
						return m.reply("Bot tidak di sewa di group ini")
					}
					const _cek = toMs(getSewaExpired(m.chat, sewa) - Date.now());
					m.reply(`*Expired :* ${_cek}`)
					break
				}
				case "bcgc": {
					if (!isOwner) {
						return m.reply(mess.owner)
					}
					if (!text) {
						return m.reply(`Example: ${command} text nya`)
					}
					const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
					let listGroups = await sock.groupFetchAllParticipating();
					m.reply(`Mengirim broadcast ke ${Object.keys(listGroups).length} groups`)
					await delay(2 * 1000)
					Object.keys(listGroups).forEach(async(key) => {
						if (!(listGroups[key].restrict)) {
							await delay(2 * 1000)
							sock.sendMessage(key, { text: text + "\n\n[ All groups Broadcast ]" , contextInfo: { forwardingScore: 1, isForwarded: true } })
						}
					});
					m.reply("selesai broadcast all groups")
					break
				}
				case "sticker": {
					if (!/image|video/i.test(mime)) {
						return m.reply("Kirim/balas gambar/video nya")
					}
					let media = await sock.downloadAndSaveMediaMessage(quoted);
					const _media = fs.readFileSync(media)
					let sticker;
					if (/video/i.test(mime)) {
						if ((quoted.msg || quoted).seconds > 11) {
							return m.reply("Max 10 detik dek");
						}
						sticker = await writeExifVid(_media, {
							packname: Config.sticker.packname,
							author: Config.sticker.author,
						});
					} else {
						sticker = await writeExifImg(_media, {
							packname: Config.sticker.packname,
							author: Config.sticker.author,
						});
					}
					await sock.sendMessage(
						m.chat,
						{
							sticker: {
								url: sticker,
							},
						},
						{ quoted: m }
					);
					fs.unlinkSync(media)
					break
				}
			default:
		}
	} catch (e) {
		m.reply(util.format(e));
	}
};
let file = require.resolve(__filename);
fs.watchFile(file, () => {
	fs.unwatchFile(file);
	console.log(chalk.green(`Update ${__filename}`));
	delete require.cache[file];
	require(file);
});
