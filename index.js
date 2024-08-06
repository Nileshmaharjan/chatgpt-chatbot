import openai from "./config/open-ai.js";
import readlineSync from "readline-sync";
import colors from "colors";
import {
  lifestyle_data_keys_for_prompt_2,
  interview_question_strucutre_for_prompt_2,
  sample_questions_for_prompt_2,
} from "./utils.js";

async function main() {
  console.log(colors.bold.green("Welcome to the Chatbot Program!"));
  console.log(colors.bold.green("You can start chatting with the bot."));

  const chatHistory = [];
  const collectedData = {};

  const initialPrompt = `
    The chatbot should conduct an interview in a conversational, professional, friendly tone and in a random order. The tone should be respectful, encouraging, and clear. Gather the following information, delimited by triple double quotes: """${lifestyle_data_keys_for_prompt_2}"""

    The chatbot should keep track of the data collected and terminate the conversation once most of the information has been gathered. It is essential to consider the emotions of the user and ensure questions are asked positively.


    Structure the conversation as follows:
    <tag>${interview_question_strucutre_for_prompt_2}</tag>

    A basic example of how the chatbot's conversation flow is provided delimited by angle brackets below:
    <${sample_questions_for_prompt_2}> 

    Follow these steps to complete the task:

    1. Proofread and correct spelling and grammar in the question structure before asking the user.
    2. Carefully examine the user's response to each question related to the information delimited by triple double quotes: """${lifestyle_data_keys_for_prompt_2}""".
    3. Determine if the response is relevant. If relevant, move to another question.
    4. If the user responds with "I don't know" or intends to skip the question, save the response as "No answer" and move to another question.
    5. If the response is improper or irrelevant, reply with "Not applicable. Please provide a relevant response." Repeat the question until a relevant response is given, then move to another question.

    After each question and response, insert a line break.

    At the end of the conversation, extract key information from relevant responses into JSON format, along with the lifestyle data keys, delimited by triple double quotes: """${lifestyle_data_keys_for_prompt_2}""". 

    - If the user wishes to exit in the middle of the interview session, then chatbot should say, "Thank you for your time" and end the conversation.

    Only include relevant responses. For example:
    - If the bot asks, "What is your age?" and the user responds, "I am 18 years old," extract "18" as ("age": 18).
    - If the user responds with "skip this question" or "I don't want to answer this question," do not include the age key in the JSON.

    It is acceptable if the user doesn't respond to all questions.

    The chatbot should create JSON based on relevant responses. Provide the JSON data to the user after asking all the questions from the keys delimited by triple double quotes: """${lifestyle_data_keys_for_prompt_2}""".
    After this, the chatbot should say "Thank you for your time" and end the conversation.
  `;

  const initialBotMessage = "Hello! Are you ready for your interview today?";

  console.log(colors.green("Bot: ") + initialBotMessage);

  chatHistory.push(["system", initialPrompt]);
  chatHistory.push(["assistant", initialBotMessage]);

  while (true) {
    const userInput = readlineSync.question(colors.yellow("You: "));
    chatHistory.push(["user", userInput]);

    try {
      const messages = chatHistory.map(([role, content]) => ({
        role,
        content,
      }));

      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
      });

      const completionText = completion.data.choices[0].message.content;
      console.log(colors.green("Bot: ") + completionText);

      chatHistory.push(["assistant", completionText]);

      const interviewOver = completionText.includes("Thank you for your time");

      if (interviewOver) {
        const jsonResponse = JSON.stringify(collectedData, null, 2);
        console.log(colors.green("Collected Data: ") + jsonResponse);
        console.log(colors.green("Bot: Thank you for your time"));
        break;
      }
    } catch (error) {
      if (error.response) {
        console.error(colors.red(error.response.data.error.code));
        console.error(colors.red(error.response.data.error.message));
        return;
      }
      console.error(colors.red(error));
      return;
    }
  }
}

main();
