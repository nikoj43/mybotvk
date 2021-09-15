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

const date = new Date();
const data = `${date.getDate() + 1}.0${date.getMonth() + 1}.${date.getFullYear()}`

const url = `http://www.krapt-rk.ru/schedule_changes/documents/pssz/${data}/%D0%97%D0%B0%D0%BC%D0%B5%D0%BD%D0%B0%20%D1%83%D1%87%D0%B5%D0%B1%D0%BD%D1%8B%D1%85%20%D0%B7%D0%B0%D0%BD%D1%8F%D1%82%D0%B8%D0%B9%20(%D0%BD%D0%B0%20${data}).docx`;

setInterval(async () => {
    fs.writeFileSync("./users.json", JSON.stringify(users, null, "\t"))
}, 500);

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
    var site = res.body.split(`schedule_changes/`);
    var site1 = site[1].split(`'>Замена`);
    var result1 = testq.stringify({query: site1[0]})
    var result2 = result1.replace(/%2F/g, `/`)
    var result3 = result2.replace(/query=/g, ``)
      var result5 = site1[0].replace("documents/pssz/17.09.2021/", ``)
      var result6 = result5.replace(".docx", ``)
    var result4 = `http://krapt-rk.ru/schedule_changes/` + result3;
    var response;
    try {
        response = await superagent.get(result4)
          .parse(superagent.parse.image)
          .buffer();
    }
    catch(err) 
    {
      return msg.send(`Не могу найти замены\nСмотрите на сайте: http://krapt-rk.ru/zoo_veter.php?%D0%9F%D0%BE%D0%B4%D0%B3%D0%BE%D1%82%D0%BE%D0%B2%D0%BA%D0%B8%20%D1%81%D0%BF%D0%B5%D1%86%D0%B8%D0%B0%D0%BB%D0%B8%D1%81%D1%82%D0%BE%D0%B2%20%D1%81%D1%80%D0%B5%D0%B4%D0%BD%D0%B5%D0%B3%D0%BE%20%D0%B7%D0%B2%D0%B5%D0%BD%D0%B0http://krapt-rk.ru/zoo_veter.php?%D0%9F%D0%BE%D0%B4%D0%B3%D0%BE%D1%82%D0%BE%D0%B2%D0%BA%D0%B8%20%D1%81%D0%BF%D0%B5%D1%86%D0%B8%D0%B0%D0%BB%D0%B8%D1%81%D1%82%D0%BE%D0%B2%20%D1%81%D1%80%D0%B5%D0%B4%D0%BD%D0%B5%D0%B3%D0%BE%20%D0%B7%D0%B2%D0%B5%D0%BD%D0%B0`)
    }
    
    const buffer = response.body;

    const text = (await mammoth.extractRawText({ buffer })).value;
    const lines = text.split('\n');

    var result = `${result6}\n`;
    for(var i = 0; i <= lines.length - 1; i++)
    {
      if(lines[i].includes("понедельник"))
      {
        result += `Понедельник: \n`
      }
      if(lines[i].includes("вторник"))
      {
        result += `Вторник: \n`
      }
      if(lines[i].includes("среда"))
      {
        result += `Среда: \n`
      }
      if(lines[i].includes("четверг"))
      {
        result += `Четверг: \n`
      }
      if(lines[i].includes("пятница"))
      {
        result += `Пятница: \n`
      }
      if(lines[i].includes("суббота"))
      {
        result += `Суббота: \n`
      }
        if(lines[i] == 'ТО-3')
        {
            if(lines[i+4].length > 1 && lines[i+4].length <= 4 || lines[i+4] == '')
            {
                result += lines[i+2] + `\n\n`;
            }
            else
            {
                result += 'Заменяемый предмет: ' +lines[i+2] + '\n№ пары: ' + lines[i+4] + '\nПреподаватель: ' + lines[i+6] + '\nЗаменяющий предмет: ' + lines[i+8]+ '\nПреподаватель: ' + lines[i+10] + '\n№ ауд.: ' + lines[i+12] + `\n\n`;
            }
        }
    }
    if(result == '')
    {
        result = `Замен нет`;
    }

    msg.reply(`${result}`);
  });
}

hearManager.hear(/^Замен/i, async (msg) => {
  var response;
  try {
      response = await superagent.get(url)
        .parse(superagent.parse.image)
        .buffer();
  }
  catch(err) 
  {
    return zamena(msg)
  }
  
  const buffer = response.body;

  const text = (await mammoth.extractRawText({ buffer })).value;
  const lines = text.split('\n');

  var result = 'Замены на ${data}:';
  for(var i = 0; i <= lines.length; i++)
  {
      if(lines[i] == 'ТО-3')
      {
          if(lines[i+4].length > 1 && lines[i+4].length <= 4 || lines[i+4] == '')
          {
              result += lines[i+2];
          }
          else
          {
              result += 'Заменяемый предмет: ' +lines[i+2] + '\n№ пары: ' + lines[i+4] + '\nПреподаватель: ' + lines[i+6] + '\nЗаменяющий предмет: ' + lines[i+8]+ '\nПреподаватель: ' + lines[i+10] + '\n№ ауд.: ' + lines[i+12];
          }
      }
  }
  if(result == '')
  {
      result = `Замен нет`;
  }

  console.log(lines)
  msg.reply(`${result}`);
})

hearManager.hear(/^расписание/i, (msg) => {
    const workbook = xlsx.readFile('1.xlsx');
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    const res = [];

    for (let z in worksheet) {
        if(z.toString()[0] === 'F'){
            res.push(worksheet[z].v);
        }
    }

    var result = '';
    var result2 = '';
    if(date.getDay() == 1)
    {
        result = `1. ` + res[1] + `\n2. `+ res[2] + `\n3. ` + res[3];
        result2 = `1. ` + res[4] + `\n2. `+ res[5] + `\n3. ` + res[6];
    }
    if(date.getDay() == 2)
    {
        result = `1. ` + res[4] + `\n2. `+ res[5] + `\n3. ` + res[6];
        result2 = `1. ` + res[7] + `\n2. `+ res[8] + `\n3. ` + res[9];
    }
    if(date.getDay() == 3)
    {
        result = `1. ` + res[7] + `\n2. `+ res[8] + `\n3. ` + res[9];
        result2 = `1. ` + res[10] + `\n2. `+ res[11] + `\n3. ` + res[12];
    }
    if(date.getDay() == 4)
    {
        result = `1. ` + res[10] + `\n2. `+ res[11] + `\n3. ` + res[12];
        result2 = `1. ` + res[13] + `\n2. `+ res[14] + `\n3. ` + res[15];
    }
    if(date.getDay() == 5)
    {
        result = `1. ` + res[13] + `\n2. `+ res[14] + `\n3. ` + res[15];
        result2 = `1. ` + res[16] + `\n2. `+ res[17] + `\n3. ` + res[18];
    }
    if(date.getDay() == 6)
    {
        result = `1. ` + res[16] + `\n2. `+ res[17] + `\n3. ` + res[18];
        result2 = `выходной`;
    }

    msg.reply(`Расписание на сегодня: \n` + result + `\n\nРасписание на завтра: \n` + result2)
})

console.log("Бот запущен");
vk.updates.start().catch(console.error);
