import 'dotenv/config';
import { App, SocketModeReceiver } from '@slack/bolt';

const receiver = new SocketModeReceiver({
  appToken: process.env.APP_TOKEN!,
  clientId: process.env.CLIENT_ID!,
  clientSecret: process.env.CLIENT_SECRET!,
});

const app = new App({
  token: process.env.BOT_TOKEN!,
  receiver,
});

app.event('app_mention', async ({ event, client, say }) => {
  const channel = (event as any).channel;
  const threadRootTs = (event as any).thread_ts || (event as any).ts;

  const resp = await client.conversations.replies({
    channel,
    ts: threadRootTs,
    limit: 200,
  });

  const msgs = resp.messages || [];

  try {
    console.log(msgs);
    
  } catch (error) {
    console.error('Failed to save to API:', error);
  }

  await say({
    thread_ts: threadRootTs,
    text: `✅ Saved ${msgs.length} messages from this thread!`,
  });
});

// Start the bot
const start = async () => {
  try {
    await app.start();
    console.log('🤖 Bot is running!');
  } catch (error) {
    console.error('Error starting bot:', error);
    process.exit(1);
  }
};

start();