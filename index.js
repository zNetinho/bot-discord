import { config } from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import { google } from 'googleapis'
import { schedule } from 'node-cron'

config();

// vai se conectar e autenticar ao discorde
const discordClient = new Client ({
  // intenções do cliente, quais as função dele
  intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds
  ]
})

// cria um cliente do youtube, usando a api do Google
const youtubeClient = google.youtube({
  // informar a versão.
  version: 'v3',
  auth: process.env.API_KEY_YOUTUBE
});



// o 'schedule' do node-cron vai ficar rodando para buscar essa info

// processo de login, passando o token da aplição
discordClient.login(process.env.TOKEN_BOT_DISCORD);

discordClient.on('ready', () => {
  console.log(`Bot on, logado como: ${discordClient.user.tag}`);
  checkNewVideos()
  // definir a função que vai ser chamada e o time desse schedule
  // defini que o código deve ser executado a cada horas
  schedule("* * 0 * * *", checkNewVideos)
});

async function checkNewVideos() {
  let lastVideoID = '';
  try {
    // busca o ultimo vídeo publicado no canal
    const response = await youtubeClient.search.list({
      // mudar o channel id para ter outro canal
      channelId: "UCpKvMmsF6QrkVr_zWaLGK-A",
      order: 'date',
      part: 'snippet',
      type: 'video',
      maxResults: 1
    }).then(res => res)
    const latestVideo = response.data.items[0]
    console.log(latestVideo)
    // se o id do último vídeo for diferente, substituir váriavel 'lastVideoID'
    if(latestVideo?.id?.videoId !== lastVideoID) {
      lastVideoID = latestVideo.id.videoId;
      const videoUrl = `https://www.youtube.com/watch?v=${lastVideoID}`;
      const message = "Confira o último vídeo do canal.";
      // pega o canal para enviar a mensagem no discord.
      const channel = discordClient.channels.cache.get("1217282334370562050");
      // enviar a mensagem
      channel.send(message + videoUrl)
    }

    console.log(latestVideo)
  } catch (error) {
    console.log("Erro ao buscar o vídeo mais recente", error)
  }
}
