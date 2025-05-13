
const fs = require('fs/promises');
const readline = require('readline');
const fetch = require('node-fetch');

async function loadConfig(filename) {
  const data = await fs.readFile(filename, 'utf-8');
  return JSON.parse(data);
}

async function getDataFromApi(query, apiKey) {
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${apiKey}`;
  const response = await fetch(url);
  
  if (response.status === 200) {
    return await response.json();
  } else {
    throw new Error(`Помилка запиту: ${response.status}`);
  }
}

function askUser(queryText) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(queryText, answer => {
    rl.close();
    resolve(answer);
  }));
}

async function main() {
  try {
    const config = await loadConfig('config.json');
    const query = await askUser('Введіть тему пошуку: ');
    const data = await getDataFromApi(query, config.api_key);
    
    const articles = data.articles.slice(0, 5);
    console.log('\n--- Результати ---');
    articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title} (${article.publishedAt})`);
      console.log(article.description);
      console.log('-------------------------');
    });

    await fs.writeFile('output.json', JSON.stringify(data, null, 2));
    console.log('\nДані збережено в output.json');
  } catch (err) {
    console.error('Помилка:', err.message);
  }
}

main();
