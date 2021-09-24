const { VK } = require('vk-io');

const { HearManager } = require('@vk-io/hear');

const vk = new VK({
  token:"3ba6ffd0f789562e1f585c7c36cf157403b363e89de8a1f3d7c2b40934f48a230862a1f5240c5110f0256"
})


const hearManager = new HearManager();

const users = require('./users.json')
const fs = require('fs')

const superagent = require('superagent');

const mammoth = require('mammoth');

var testq = require("querystring");

var needle = require('needle');

var URL = 'http://krapt-rk.ru/zoo_veter.php?query=%D0%9F%D0%BE%D0%B4%D0%B3%D0%BE%D1%82%D0%BE%D0%B2%D0%BA%D0%B8%2520%D1%81%D0%BF%D0%B5%D1%86%D0%B8%D0%B0%D0%BB%D0%B8%D1%81%D1%82%D0%BE%D0%B2%2520%D1%81%D1%80%D0%B5%D0%B4%D0%BD%D0%B5%D0%B3%D0%BE%2520%D0%B7%D0%B2%D0%B5%D0%BD%D0%B0';

const _ = require('lodash');
const xlsx = require('xlsx');

const utils = {
	sp: (int) => {
		int = int.toString();
		return int.split('').reverse().join('').match(/[0-9]{1,3}/g).join('.').split('').reverse().join('');
	},
	rn: (int, fixed) => {
		if (int === null) return null;
		if (int === 0) return '0';
		fixed = (!fixed || fixed < 0) ? 0 : fixed;
		let b = (int).toPrecision(2).split('e'),
			k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3),
			c = k < 1 ? int.toFixed(0 + fixed) : (int / Math.pow(10, k * 3) ).toFixed(1 + fixed),
			d = c < 0 ? c : Math.abs(c),
			e = d + ['', 'тыс', 'млн', 'млрд', 'трлн'][k];

			e = e.replace(/e/g, '');
			e = e.replace(/\+/g, '');
			e = e.replace(/Infinity/g, 'ДОХЕРА');

		return e;
	},
	gi: (int) => {
		int = int.toString();

		let text = ``;
		for (let i = 0; i < int.length; i++)
		{
			text += `${int[i]}&#8419;`;
		}

		return text;
	},
	decl: (n, titles) => { return titles[(n % 10 === 1 && n % 100 !== 11) ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2] },
	random: (x, y) => {
		return y ? Math.round(Math.random() * (y - x)) + x : Math.round(Math.random() * x);
	},
	pick: (array) => {
		return array[utils.random(array.length - 1)];
	}
}

setInterval(async () => { fs.writeFileSync("./users.json", JSON.stringify(users, null, "\t")) }, 500);

vk.updates.on(['message'], async (next, context) => {
  if(users.filter(x => x.id === next.senderId)[0]) return context()
  
  users.push({
    id: next.senderId,
  })
  return context()
})

vk.updates.on('message_new', hearManager.middleware);

function zamena(msg)
{
  needle.get(URL, async function(err, res){
    if (err) throw err;
    let site = res.body.split(`schedule_changes/`);
    let site1 = ``;
    if(site.length > 2) { site1 = site[2].split(`'>Замена`); }
    else { site1 = site[1].split(`'>Замена`); }
    let result1 = testq.stringify({query: site1[0]})
    let result2 = result1.replace(/%2F/g, `/`)
    let result3 = result2.replace(/query=/g, ``)
    let result5 = site1[0].split("/Замена")
    let result6 = result5[1].replace(".docx", ``)
    let result4 = `http://krapt-rk.ru/schedule_changes/` + result3;
    let response;
    try {
        response = await superagent.get(result4)
          .parse(superagent.parse.image)
          .buffer();
    }
    catch(err) { return msg.send(`Не могу найти замены`) }
    
    const buffer = response.body;

    const text = (await mammoth.extractRawText({ buffer })).value;
    const lines = text.split('\n');

    let result = `Замены${result6}\n`;
    let resultpr = '';
    for(let i = 0; i <= lines.length - 1; i++)
    {
      if(lines[i].includes("понедельник")) { result += `Понедельник: \n` }
      if(lines[i].includes("вторник")) { result += `Вторник: \n` }
      if(lines[i].includes("среда")) { result += `Среда: \n` }
      if(lines[i].includes("четверг")) { result += `Четверг: \n` }
      if(lines[i].includes("пятница")) { result += `Пятница: \n` }
      if(lines[i].includes("суббота")) { result += `Суббота: \n` }
      if(lines[i] == 'ТО-3')
      {
          if(lines[i+4].length > 1 && lines[i+4].length <= 4 || lines[i+4] == '') { resultpr += lines[i+2] + `\n\n`; }
          else { resultpr += 'Заменяемый предмет: ' +lines[i+2] + '\n№ пары: ' + lines[i+4] + '\nПреподаватель: ' + lines[i+6] + '\nЗаменяющий предмет: ' + lines[i+8]+ '\nПреподаватель: ' + lines[i+10] + '\n№ ауд.: ' + lines[i+12] + `\n\n`; }
      }
    }

    if(resultpr == '') { resultpr = 'Замен нет' }

    msg.reply(`${result} ${resultpr}`);
  });
}

hearManager.hear(/^(Руба |Руба,|Руба, )Замен/i, async (msg) => {
  let response;
  const date = new Date();
  const data = `${date.getDate() + 1}.0${date.getMonth() + 1}.${date.getFullYear()}`

  const url1 = `http://www.krapt-rk.ru/schedule_changes/documents/pssz/${data}/%D0%97%D0%B0%D0%BC%D0%B5%D0%BD%D0%B0%20%D1%83%D1%87%D0%B5%D0%B1%D0%BD%D1%8B%D1%85%20%D0%B7%D0%B0%D0%BD%D1%8F%D1%82%D0%B8%D0%B9%20(%D0%BD%D0%B0%20${data}).docx`;

  try {
      response = await superagent.get(url1)
        .parse(superagent.parse.image)
        .buffer();
  }
  catch(err) { return zamena(msg) }
  
  const buffer = response.body;

  const text = (await mammoth.extractRawText({ buffer })).value;
  const lines = text.split('\n');

  let result = 'Замены на ${data}:\n';
  for(let i = 0; i <= lines.length; i++)
  {
    if(lines[i].includes("понедельник")) { result += `Понедельник: \n` }
    if(lines[i].includes("вторник")) { result += `Вторник: \n` }
    if(lines[i].includes("среда")) { result += `Среда: \n` }
    if(lines[i].includes("четверг")) { result += `Четверг: \n` }
    if(lines[i].includes("пятница")) { result += `Пятница: \n` }
    if(lines[i].includes("суббота")) { result += `Суббота: \n` }
    if(lines[i] == 'ТО-3')
    {
      if(lines[i+4].length > 1 && lines[i+4].length <= 4 || lines[i+4] == '') { result += lines[i+2]; }
      else { result += 'Заменяемый предмет: ' +lines[i+2] + '\n№ пары: ' + lines[i+4] + '\nПреподаватель: ' + lines[i+6] + '\nЗаменяющий предмет: ' + lines[i+8]+ '\nПреподаватель: ' + lines[i+10] + '\n№ ауд.: ' + lines[i+12]; }
    }
  }
  if(result == '') { result = `Замен нет`; }

  msg.reply(`${result}`);
})

hearManager.hear(/^(Руба |Руба,|Руба, )(?:расписание)\s(.*)$/i, (msg) => {
  const workbook = xlsx.readFile('1.xlsx');
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  const res = [];

  for (let z in worksheet) { if(z.toString()[0] === 'F') { res.push(worksheet[z].v); } }

  const date = new Date();
  let data;

  if(msg.$match[2].toLowerCase().includes("сегодня")) { data = date.getDay() }
  if(msg.$match[2].toLowerCase().includes("завтра")) { data = date.getDay() + 1 }
  if(!msg.$match[2].toLowerCase().includes("завтра") && !msg.$match[2].toLowerCase().includes("сегодня")) { return msg.reply('Не понял тебя') }

  let result = '';
  if(data == 1) { result = `1. ` + res[1] + `\n2. `+ res[2] + `\n3. ` + res[3]; }
  if(data == 2) { result = `1. ` + res[4] + `\n2. `+ res[5] + `\n3. ` + res[6]; }
  if(data == 3) { result = `1. ` + res[7] + `\n2. `+ res[8] + `\n3. ` + res[9]; }
  if(data == 4) { result = `1. ` + res[10] + `\n2. `+ res[11] + `\n3. ` + res[12]; }
  if(data == 5) { result = `1. ` + res[13] + `\n2. `+ res[14] + `\n3. ` + res[15]; }
  if(data == 6){ result = `1. ` + res[16] + `\n2. `+ res[17] + `\n3. ` + res[18]; }

  msg.reply(`Расписание на ${msg.$match[2]}: \n` + result)
})

hearManager.hear(/^(Руба |Руба,|Руба, )(?:инфа|вероятность)\s([^]+)$/i, (msg) => {
	const phrase = utils.pick(['Вероятность', 'Мне кажется около']);
	const percent = utils.random(100);
	msg.reply(`${phrase} ${percent}%`)
});

hearManager.hear(/^(Руба |Руба,|Руба, )(?:шар)\s([^]+)$/i, (msg) => {
	const phrase = utils.pick(['Перспективы не очень хорошие', 'Сейчас нельзя предсказать', 'Пока не ясно', 'Знаки говорят - "Да"', 'Знаки говорят - "Нет"', 'Можешь быть уверен в этом', 'Мой ответ - "нет"', 'Мой ответ - "да"', 'Бесспорно', 'Мне кажется - "Да"', 'Мне кажется - "Нет"']);
	msg.reply(phrase);
});

function rand(text) {
	let tts = Math.floor(text.length * Math.random())
	return text[tts]
}

hearManager.hear(/^(Руба |Руба,|Руба, )(?:кто)\s([^]+)$/i, async (msg) => {
	let users = await vk.api.messages.getConversationMembers({
    peer_id: msg.peerId
  });
  let users2 = await  users.items;
  let i = rand(users2).member_id
  let phrases = rand(['Я знаю, это', 'Это же очевидно, это', 'Вангую, это', 'Как не понять, что это', 'Инфа сотка, что это', 'Конечно-же это', 'Естественно это'])
  while(i < 0) { i = rand(users2).member_id }
  let username = await vk.api.users.get({user_ids: i});
  msg.reply(phrases + ` - [id` + i + `|` + username[0].first_name + ` ` + username[0].last_name + `]`);
});

console.log("Бот запущен");
vk.updates.start().catch(console.error);