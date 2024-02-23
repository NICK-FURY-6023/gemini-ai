const discord = require("discord.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const DEV = `₦ł₵₭ ₣ɄⱤɎ ⚒`;

const MODEL = "gemini-pro"; //Don't change this VALUE
const API_KEY = ""; // API KEY of Google Gemini pro ai
const BOT_TOKEN = ""; // Token of Discord Bot
const CHANNEL_IDS = ["1176084631825678336", "1204444706142945350"]; // Add your channel IDs here where you want chat with bot
const DEVELOPER_ID = "761635564835045387"; // Replace with the developer's user ID

const ai = new GoogleGenerativeAI(API_KEY);
const model = ai.getGenerativeModel({ model: MODEL });

const client = new discord.Client({
    intents: Object.keys(discord.GatewayIntentBits),
});

let apiIssueNotified = false; // Flag to track whether API issue notification has been sent
let errorNotified = false; // Flag to track whether error notification has been sent

client.on("ready", () => {
    console.log(` ❤️ ${DEV} ❤️ `);
    console.log(`Logged in as 🤖 ${client.user.tag} 🤖`);
});

client.login(BOT_TOKEN);

client.on("messageCreate", async (message) => {
    try {
        // Handle commands
        if (message.content.startsWith('!')) return;

        // Other message handling logic
        if (message.author.bot) return;
        if (!CHANNEL_IDS.includes(message.channel.id)) return; // Check if the channel ID is in the array

        // Preprocess the message content
        const cleanedContent = preprocessMessage(message.cleanContent);
        const { response } = await model.generateContent(cleanedContent);
        const generatedText = response.candidates[0]?.content.parts.map(part => part.text).join('');

        if (generatedText) {
            console.log("Reply Content:", generatedText);

            // Split the generated content into chunks of 2000 characters
            const chunks = splitTextIntoChunks(generatedText);

            // Send each chunk as a separate message with a delay for a conversational effect
            for (const [index, chunk] of chunks.entries()) {
                await delay(index * 1500); // Delay between messages
                await message.reply({
                    content: chunk,
                });
            }
        } else {
            console.log("No generated text found.");
            // If API issue notification has not been sent yet, notify user and developer
            if (!apiIssueNotified) {
                const errorMessage = `Sorry, I'm unable to generate a response at the moment due to API issues. I'll inform my developer. ${DEV}`;
                await message.reply(errorMessage);
                const developerMessage = `Hey <@${DEVELOPER_ID}>, the bot encountered an API issue. Please investigate.`;
                await message.channel.send(developerMessage);
                // Set the flag to true
                apiIssueNotified = true;
            }
        }
    } catch (e) {
        console.error("Error:", e);
        // If error notification has not been sent yet, notify user and developer
        if (!errorNotified) {
            const errorMessage = `Sorry, an error occurred. I'll inform my developer. ${DEV}`;
            await message.reply(errorMessage);
            const developerMessage = `Hey <@${DEVELOPER_ID}>, the bot encountered an error. Please investigate.`;
            await message.channel.send(developerMessage);
            // Set the flag to true
            errorNotified = true;
        }
    }
});

function preprocessMessage(content) {
    // Example: Remove mentions and emojis
    return content.replace(/<@.*?>/g, '').replace(/<:.+?:\d+>/g, '');
}

function splitTextIntoChunks(text, chunkSize = 2000) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
