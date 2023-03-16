/** @warning DECODED BY FrierenDv */

const Config = require("./config.js");
const {
		default: WADefault,
		useMultiFileAuthState,
		DisconnectReason,
		fetchLatestBaileysVersion,
		generateForwardMessageContent,
		prepareWAMessageMedia,
		generateWAMessageFromContent,
		generateMessageID,
		downloadContentFromMessage,
		makeInMemoryStore,
		jidDecode,
		proto,
	} = require("@adiwajshing/baileys"),
	pino = require("pino"),
	{ Boom } = require("@hapi/boom"),
	fs = require("fs"),
	axios = require("axios"),
	FileType = require("file-type"),
	PhoneNumber = require("awesome-phonenumber"),
	{ smsg, getBuffer, fetchJson } = require("./lib/simple"),
	{
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
let set_welcome_db = JSON.parse(fs.readFileSync("./database/set_welcome.json"));
let set_left_db = JSON.parse(fs.readFileSync("./database/set_left.json")),
	_welcome = JSON.parse(fs.readFileSync("./database/welcome.json"));
let _left = JSON.parse(fs.readFileSync("./database/left.json")),
	set_proses = JSON.parse(fs.readFileSync("./database/set_proses.json")),
	set_done = JSON.parse(fs.readFileSync("./database/set_done.json")),
	set_open = JSON.parse(fs.readFileSync("./database/set_open.json"));
let set_close = JSON.parse(fs.readFileSync("./database/set_close.json"));
let sewa = JSON.parse(fs.readFileSync("./database/sewa.json")),
	opengc = JSON.parse(fs.readFileSync("./database/opengc.json")),
	antilink = JSON.parse(fs.readFileSync("./database/antilink.json"));
let antiwame = JSON.parse(fs.readFileSync("./database/antiwame.json")),
	db_respon_list = JSON.parse(fs.readFileSync("./database/list.json"));
const _opts = {};
_opts.level = "silent";
_opts.stream = "store";
const store = makeInMemoryStore({ logger: pino().child(_opts) });
async function Botstarted() {
	const { state, saveCreds } = await useMultiFileAuthState("./session"),
		sock = WADefault({
			logger: pino({ level: "silent" }),
			printQRInTerminal: true,
			browser: ["BOT STORE", "Safari", "1.0.0"],
			patchMessageBeforeSending: (message) => {
				const requiresPatch = !!(
					message.buttonsMessage ||
					message.templateMessage ||
					message.listMessage
				);
				if (requiresPatch) {
					const device = {
						deviceListMetadataVersion: 2,
						deviceListMetadata: {},
					};
					message = {
						viewOnceMessage: {
							message: {
								messageContextInfo: device,
								...message,
							},
						},
					};
				}
				return message;
			},
			auth: state,
		});
	store.bind(sock.ev);
	sock.ev.on("messages.upsert", async (msg) => {
		try {
			mek = msg.messages[0];
			if (!mek.message) {
				return;
			}
			mek.message =
				Object.keys(mek.message)[0] === "ephemeralMessage"
					? mek.message.ephemeralMessage.message
					: mek.message;
			if (mek.key && mek.key.remoteJid === "status@broadcast") {
				return;
			}
			if (!sock.public && !mek.key.fromMe && msg.type === "notify") {
				return;
			}
			if (mek.key.id.startsWith("BAE5") && mek.key.id.length === 16) {
				return;
			}
			m = smsg(sock, mek, store);
			require("./handler.js")(
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
				_left,
				db_respon_list
			);
		} catch (e) {
			console.log(e);
		}
	});
	sock.ev.on("groups.update", async (participants) => {
		try {
			for (let x of participants) {
				try {
					ppgc = await sock.profilePictureUrl(x.id, "image");
				} catch {
					ppgc = "https://telegra.ph/file/c3f3d2c2548cbefef1604.jpg";
				}
				if (x.announce == true) {
					sock.sendMessage(x.id, {
						image: { url: ppgc },
						caption:
							"*\u300C Group Update Detected \u300D*\n\nGroup telah ditutup, Sekarang hanya admin yang dapat mengirim pesan !",
					});
				} else {
					if (x.announce == false) {
						sock.sendMessage(x.id, {
							image: { url: ppgc },
							caption:
								"*\u300C Group Update Detected \u300D*\n\nGroup telah dibuka, Sekarang peserta dapat mengirim pesan !",
						});
					} else {
						if (x.restrict == true) {
							sock.sendMessage(x.id, {
								image: { url: ppgc },
								caption:
									"*\u300C Group Update Detected \u300D*\n\nInfo group telah dibatasi, Sekarang hanya admin yang dapat mengedit info group !",
							});
						} else {
							if (x.restrict == false) {
								sock.sendMessage(x.id, {
									image: { url: ppgc },
									caption:
										"*\u300C Group Update Detected \u300D*\n\nInfogroup telah dibuka, Sekarang peserta dapat mengedit info group !",
								});
							} else {
								sock.sendMessage(x.id, {
									image: { url: ppgc },
									caption:
										"*\u300C Group Update Detected \u300D*\n\nNama Group telah diganti menjadi *" +
										x.subject +
										"*",
								});
							}
						}
					}
				}
			}
		} catch (e) {
			console.log(e);
		}
	});
	sock.ev.on("group-participants.update", async (group) => {
		const isWelcome = _welcome.includes(group.id),
			isLeft = _left.includes(group.id);
		try {
			let metadata = await sock.groupMetadata(group.id),
				participants = group.participants;
			const subject = metadata.subject,
				desc = metadata.desc;
			for (let user of participants) {
				try {
					ppuser = await sock.profilePictureUrl(user, "image");
				} catch {
					ppuser = "https://telegra.ph/file/c3f3d2c2548cbefef1604.jpg";
				}
				try {
					ppgroup = await sock.profilePictureUrl(group.id, "image");
				} catch {
					ppgroup = "https://telegra.ph/file/c3f3d2c2548cbefef1604.jpg";
				}
				if (group.action == "add" && isWelcome) {
					console.log(group);
					if (isSetWelcome(group.id, set_welcome_db)) {
						var textWelcome = await getTextSetWelcome(group.id, set_welcome_db),
							pesan = textWelcome.replace(/@user/gi, "@" + user.split("@")[0]);
						sock.sendMessage(group.id, {
							image: { url: ppuser },
							mentions: [user],
							caption:
								"" +
								pesan.replace(/@group/gi, subject).replace(/@desc/gi, desc),
						});
					} else {
						sock.sendMessage(group.id, {
							image: { url: ppuser },
							mentions: [user],
							caption:
								"Halo @" +
								user.split("@")[0] +
								", Welcome To " +
								metadata.subject,
						});
					}
				} else {
					if (group.action == "remove" && isLeft) {
						console.log(group);
						if (isSetLeft(group.id, set_left_db)) {
							var textLeft = await getTextSetLeft(group.id, set_left_db),
								pesan = textLeft.replace(/@user/gi, "@" + user.split("@")[0]);
							sock.sendMessage(group.id, {
								image: { url: ppuser },
								mentions: [user],
								caption:
									"" +
									pesan.replace(/@group/gi, subject).replace(/@desc/gi, desc),
							});
						} else {
							sock.sendMessage(group.id, {
								image: { url: ppuser },
								mentions: [user],
								caption: "Sayonara @" + user.split("@")[0],
							});
						}
					} else {
						if (group.action == "promote") {
							sock.sendMessage(group.id, {
								image: { url: ppuser },
								mentions: [user],
								caption:
									"@" +
									user.split("@")[0] +
									" sekaran menjadi admin grup " +
									metadata.subject,
							});
						} else {
							if (group.action == "demote") {
								sock.sendMessage(group.id, {
									image: { url: ppuser },
									mentions: [user],
									caption:
										"@" +
										user.split("@")[0] +
										" bukan admin grup " +
										metadata.subject +
										" lagi",
								});
							}
						}
					}
				}
			}
		} catch (e) {
			console.log(e);
		}
	});
	sock.decodeJid = (jid) => {
		if (!jid) {
			return jid;
		}
		if (/:\d+@/gi.test(jid)) {
			let _sock = jidDecode(jid) || {};
			return (
				(_sock.user && _sock.server && _sock.user + "@" + _sock.server) || jid
			);
		} else {
			return jid;
		}
	};
	sock.ev.on("contacts.update", (contacts) => {
		for (let contact of contacts) {
			let id = sock.decodeJid(contact.id);
			if (store && store.contacts) {
				store.contacts[id] = {
					id: id,
					name: contact.notify,
				};
			}
		}
	});
	sock.getName = (jid, withoutName = false) => {
		id = sock.decodeJid(jid);
		withoutName = sock.withoutContact || withoutName;
		let _name;
		if (id.endsWith("@g.us")) {
			return new Promise(async (resolve) => {
				_name = store.contacts[id] || {};
				if (!(_name.name || _name.subject)) {
					_name = sock.groupMetadata(id) || {};
				}
				resolve(
					_name.name ||
						_name.subject ||
						PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber(
							"international"
						)
				);
			});
		} else {
			_name =
				id === "0@s.whatsapp.net"
					? {
							id: id,
							name: "WhatsApp",
					  }
					: id === sock.decodeJid(sock.user.id)
					? sock.user
					: store.contacts[id] || {};
		}
		return (
			(withoutName ? "" : _name.name) ||
			_name.subject ||
			_name.verifiedName ||
			PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber(
				"international"
			)
		);
	};
	sock.sendContact = async (jid, _contacts, m = "", opts = {}) => {
		let contacts = [];
		for (let i of _contacts) {
			contacts.push({
				displayName: await sock.getName(i + "@s.whatsapp.net"),
				vcard:
					"BEGIN:VCARD\nVERSION:3.0\nN:" +
					(await sock.getName(i + "@s.whatsapp.net")) +
					"\nFN:" +
					(await sock.getName(i + "@s.whatsapp.net")) +
					"\nitem1.TEL;waid=" +
					i +
					":" +
					i +
					"\nitem1.X-ABLabel:Ponsel\nEND:VCARD",
			});
		}
		const listContacts = {
			contacts: {
				displayName: contacts.length + " Kontak",
				contacts: contacts,
			},
			...opts,
		};
		sock.sendMessage(jid, listContacts, { quoted: m });
	};
	sock.public = true;
	sock.serializeM = (m) => smsg(sock, m, store);
	sock.ev.on("connection.update", async (Meki) => {
		const { connection: Conn, lastDisconnect: Disconnect } = Meki;
		if (Conn === "close") {
			// Fuck*ng statement
			let koneksi = new Boom(Disconnect?.error)?.output.statusCode;
			if (koneksi === DisconnectReason.badSession) {
				console.log("Bad Session File, Please Delete Session and Scan Again");
				sock.logout();
			} else {
				if (koneksi === DisconnectReason.connectionClosed) {
					console.log("Connection closed, reconnecting....");
					Botstarted();
				} else {
					if (koneksi === DisconnectReason.connectionLost) {
						console.log("Connection Lost from Server, reconnecting...");
						Botstarted();
					} else {
						if (koneksi === DisconnectReason.connectionReplaced) {
							console.log(
								"Connection Replaced, Another New Session Opened, reconnecting..."
							);
							Botstarted();
						} else {
							if (koneksi === DisconnectReason.loggedOut) {
								console.log("Device Logged Out, Please Scan Again And Run.");
								sock.logout();
							} else {
								if (koneksi === DisconnectReason.restartRequired) {
									console.log("Restart Required, Restarting...");
									Botstarted();
								} else {
									if (koneksi === DisconnectReason.timedOut) {
										console.log("Connection TimedOut, Reconnecting...");
										Botstarted();
									} else {
										if (koneksi === DisconnectReason.Multidevicemismatch) {
											console.log("Multi device mismatch, please scan again");
											sock.logout();
										} else {
											sock.end(
												"Unknown DisconnectReason: " + koneksi + "|" + Conn
											);
										}
									}
								}
							}
						}
					}
				}
			}
		}
		if (Conn == "open") {
			await store.chats.all();
			console.log(Conn);
		}
	});
	sock.ev.on("creds.update", saveCreds);
	// Probably unused
	return (
		(sock.sendText = (_0x2b1dd9, _0x12de41, _0x49be42 = "", _0x4f3c92) =>
			sock.sendMessage(
				_0x2b1dd9,
				{
					text: _0x12de41,
					..._0x4f3c92,
				},
				{
					quoted: _0x49be42,
					..._0x4f3c92,
				}
			)),
		(sock.downloadAndSaveMediaMessage = async (
			_0x2b1767,
			_0x417be4,
			_0xe660c3 = true
		) => {
			let _0x5d0ea4 = _0x2b1767.msg ? _0x2b1767.msg : _0x2b1767;
			let _0x5dbc96 = (_0x2b1767.msg || _0x2b1767).mimetype || "";
			let _0x5c25f8 = _0x2b1767.mtype
				? _0x2b1767.mtype.replace(/Message/gi, "")
				: _0x5dbc96.split("/")[0];
			const _0x58ccb7 = await downloadContentFromMessage(_0x5d0ea4, _0x5c25f8);
			let _0x46bf2e = Buffer.from([]);
			for await (const _0x3df6cf of _0x58ccb7) {
				_0x46bf2e = Buffer.concat([_0x46bf2e, _0x3df6cf]);
			}
			let _0x19179a = await FileType.fromBuffer(_0x46bf2e);
			trueFileName = _0xe660c3 ? _0x417be4 + "." + _0x19179a.ext : _0x417be4;
			return await fs.writeFileSync(trueFileName, _0x46bf2e), trueFileName;
		}),
		(sock.sendTextWithMentions = async (
			_0x3cfdc1,
			_0x26fc2d,
			_0x19f08b,
			_0x3aac8c = {}
		) =>
			sock.sendMessage(
				_0x3cfdc1,
				{
					text: _0x26fc2d,
					mentions: [..._0x26fc2d.matchAll(/@(\d{0,16})/g)].map(
						(_0x525790) => _0x525790[1] + "@s.whatsapp.net"
					),
					..._0x3aac8c,
				},
				{ quoted: _0x19f08b }
			)),
		sock
	);
}
Botstarted();
