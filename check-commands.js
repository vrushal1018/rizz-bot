require('dotenv').config();
const { REST, Routes } = require('discord.js');

async function checkCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  
  try {
    console.log('🔍 Checking registered commands...');
    
    const commands = await rest.get(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID)
    );
    
    console.log(`✅ Found ${commands.length} registered commands:`);
    commands.forEach(cmd => {
      console.log(`  - /${cmd.name}: ${cmd.description}`);
    });
    
    if (commands.length === 0) {
      console.log('❌ No commands found. Make sure to run `node deploy.js` first.');
    }
    
  } catch (error) {
    console.error('❌ Error checking commands:', error);
  }
}

checkCommands(); 